import base64
import json
import logging
import time
from typing import Any, Dict, Tuple
import requests
from fastapi import HTTPException, status
from app.config import settings

logger = logging.getLogger("splitbill.gemini_service")

# Model fallback order: exact user-specified priority followed by active vision models
MODELS_TO_TRY = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-flash",
    "gemini-flash-latest",
    "gemini-3.5-flash",
    "gemini-3.7-flash",
    "gemini-flash-lite-latest",
]

RETRY_DELAYS = [1, 2]  # Exponential backoff: 1s, 2s (maximum 2 retries on HTTP 503)

SYSTEM_PROMPT = """You are a precision restaurant bill OCR engine. Your sole job is to extract ONLY the line items and bill summary that physically exist on this receipt image.

CRITICAL EXTRACTION RULES:
1. ZERO HALLUCINATION: Extract ONLY items that are visibly printed on the receipt. NEVER invent, hallucinate, assume, or add any food, drink, or mock dishes not present in this image.
2. LINE ITEMS ONLY:
   - Extract only purchased dishes, food items, beverages, drinks, and merchandise.
   - STRICTLY NEVER EXTRACT AS LINE ITEMS:
     * Restaurant street address, city, state, pincode, website, or email.
     * GSTIN, VAT number, PAN, FSSAI, or tax registration IDs.
     * Phone numbers, mobile numbers, or landlines.
     * Table number, token number, check/order number, server/waiter name.
     * Subtotal, CGST, SGST, IGST, VAT, Service Charge, Packaging fee, Round-off lines.
     * Payment QR code descriptions, UPI IDs, payment modes (Cash/Card/UPI), card transaction numbers, EDC/RRN slips.
     * Greeting or footer messages (e.g. "Thank you", "Visit Again", "Have a nice day", "Feedback", "Customer Care", "Terms & Conditions").
3. QUANTITIES:
   - Extract quantity from patterns like "2", "2x", "x2", "2 Qty", "2 × Item", or default to 1 if not specified.
4. PRICES:
   - Extract the unit price and total price for each line item.
   - If only one price appears on the line, use that as both unitPrice and totalPrice (adjusted for quantity if needed).
5. CONFIDENCE SCORING:
   - Assign "high" if the text and price are clearly legible.
   - Assign "medium" if text is slightly faded, skewed, or partially ambiguous.
   - Assign "low" only if text is blurry, handwritten, creased, or cut off.

Return ONLY valid JSON with this exact schema (no markdown formatting, no commentary):
{
  "restaurant": {
    "name": "Restaurant Name",
    "date": "Date if visible",
    "time": "Time if visible",
    "billNumber": "Invoice number if visible",
    "location": "Location if visible"
  },
  "charges": {
    "subtotal": 0.00,
    "gst": 0.00,
    "serviceCharge": 0.00,
    "discount": 0.00,
    "grandTotal": 0.00
  },
  "items": [
    {
      "name": "Exact item name as printed",
      "quantity": 1,
      "unitPrice": 0.00,
      "totalPrice": 0.00,
      "category": "Main Course",
      "confidence": "high"
    }
  ]
}"""


def _call_gemini_api(
    model: str,
    api_key: str,
    image_bytes: bytes,
    mime_type: str,
) -> Tuple[int, str]:
    """Execute direct REST request to Gemini Vision endpoint with 90s timeout.

    Returns:
        Tuple of (status_code, response_text)
    """
    base64_image = base64.b64encode(image_bytes).decode("utf-8")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": SYSTEM_PROMPT},
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": base64_image,
                        }
                    },
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.1,
        },
    }

    try:
        response = requests.post(
            url,
            headers={"Content-Type": "application/json"},
            json=payload,
            timeout=90,
        )
        return response.status_code, response.text
    except requests.exceptions.RequestException as e:
        logger.warning(f"Network error calling Gemini model '{model}': {str(e)}")
        return 503, str(e)


def extract_receipt_with_gemini(image_bytes: bytes, mime_type: str) -> Tuple[Dict[str, Any], str]:
    """Extract receipt data using Gemini Vision with model fallback and exponential backoff retry on HTTP 503.

    Returns:
        Tuple of (raw_extracted_json_dict, model_name_used)
    Raises:
        HTTPException(503) if all models and retries fail.
        HTTPException(500) if API key is missing.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.error("GEMINI_API_KEY is not configured in backend environment.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API Key is not configured on the server. Please check backend .env file.",
        )

    start_time = time.time()
    last_error = ""

    for model_idx, model in enumerate(MODELS_TO_TRY):
        logger.info(f"Attempting receipt extraction with model: '{model}' (Option {model_idx + 1}/{len(MODELS_TO_TRY)})")

        # Try initial call (attempt 0) + up to 2 retries on HTTP 503 (attempt 1, attempt 2)
        max_attempts = len(RETRY_DELAYS) + 1  # 1 initial + 2 retries = 3 attempts total

        for attempt in range(max_attempts):
            if attempt > 0:
                delay = RETRY_DELAYS[attempt - 1]
                logger.warning(
                    f"Model '{model}' returned 503. Retry #{attempt}/2 in {delay}s exponential backoff..."
                )
                time.sleep(delay)

            status_code, response_body = _call_gemini_api(model, api_key, image_bytes, mime_type)

            if status_code == 200:
                try:
                    res_json = json.loads(response_body)
                    parts = res_json.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                    text_part = next((p.get("text") for p in parts if p.get("text")), None)

                    if not text_part:
                        raise ValueError("No text content returned from Gemini model candidate parts")

                    # Strip markdown code fences if present
                    clean_text = (
                        text_part.replace("```json", "")
                        .replace("```", "")
                        .strip()
                    )
                    parsed_dict = json.loads(clean_text)

                    elapsed = time.time() - start_time
                    logger.info(
                        f"Successfully extracted receipt using model: '{model}' in {elapsed:.2f}s total extraction time."
                    )
                    return parsed_dict, model

                except Exception as parse_err:
                    logger.warning(f"Failed to parse valid JSON from model '{model}': {str(parse_err)}")
                    last_error = f"Invalid JSON returned from model {model}"
                    break  # Break retry loop, proceed to next model

            elif status_code == 503:
                # If exhausted 2 retries, log and switch to next model immediately
                if attempt == max_attempts - 1:
                    logger.warning(
                        f"Model '{model}' exhausted all {len(RETRY_DELAYS)} 503 retries. Switching to next fallback model..."
                    )
                    last_error = f"Model {model} returned 503 Service Unavailable"
                    break
                # Otherwise continue to next retry attempt in loop
                continue

            elif status_code == 429:
                logger.warning(
                    f"Model '{model}' returned 429 (quota rate limit exceeded). Switching to next fallback model..."
                )
                last_error = f"Model {model} returned 429 Quota Exceeded"
                break

            elif status_code == 404:
                logger.warning(
                    f"Model '{model}' returned 404 (model not found). Switching to next fallback model..."
                )
                last_error = f"Model {model} not found (404)"
                break

            else:
                logger.warning(
                    f"Model '{model}' returned HTTP {status_code}: {response_body[:200]}. Switching to next fallback model..."
                )
                last_error = f"Model {model} returned HTTP {status_code}"
                break

    # If all models exhausted
    total_elapsed = time.time() - start_time
    logger.error(
        f"All Gemini Vision models failed after {total_elapsed:.2f}s. Last error: {last_error}"
    )
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail={
            "status": "unavailable",
            "message": "Gemini OCR service is temporarily unavailable. Please retry extraction in a few moments.",
        },
    )
