import base64
import json
import logging
import time
from typing import Any, Dict, Tuple
import requests
from fastapi import HTTPException, status
from app.config import settings

logger = logging.getLogger("splitbill.gemini_service")

# Model fallback order as required by specification
MODELS_TO_TRY = [
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-flash",
    "gemini-flash-latest",
]

RETRY_DELAYS = [1, 2, 4]  # 1s, 2s, 4s exponential backoff on HTTP 503

SYSTEM_PROMPT = """You are a precision restaurant bill OCR engine. Your sole job is to extract ONLY the line items and bill summary that physically exist on this receipt image.

CRITICAL EXTRACTION RULES:
1. ZERO HALLUCINATION: Extract ONLY items that are visibly printed on the receipt. NEVER invent, hallucinate, assume, or add any food, drink, or mock dishes not present in this image.
2. LINE ITEMS ONLY:
   - Extract only purchased dishes, food items, drinks, and merchandise.
   - STRICTLY IGNORE: Restaurant address, phone number, GSTIN/tax IDs, table number, order/check ID, server name, subtotal lines, tax lines (CGST/SGST/VAT), service charge lines, round-off lines, payment method (Cash/Card/UPI), card transaction details, UPI IDs, QR codes, and greeting/thank you messages.
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
    """Execute direct REST request to Gemini Vision endpoint.

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
            timeout=40,
        )
        return response.status_code, response.text
    except requests.exceptions.RequestException as e:
        logger.warning(f"Network error calling Gemini model {model}: {str(e)}")
        return 503, str(e)


def extract_receipt_with_gemini(image_bytes: bytes, mime_type: str) -> Tuple[Dict[str, Any], str]:
    """Extract receipt data using Gemini Vision with model fallback and exponential backoff retry on HTTP 503.

    Returns:
        Tuple of (raw_extracted_json_dict, model_name_used)
    Raises:
        HTTPException(503) if all models and retries fail.
        HTTPException(400) if API key missing or image completely rejected.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        logger.error("GEMINI_API_KEY is not configured in backend environment.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API Key is not configured on the server. Please check backend .env file.",
        )

    last_error = ""

    for model in MODELS_TO_TRY:
        logger.info(f"Attempting receipt extraction with model: {model}")

        # Try with up to 3 retries on HTTP 503
        for attempt in range(len(RETRY_DELAYS) + 1):
            status_code, response_body = _call_gemini_api(model, api_key, image_bytes, mime_type)

            if status_code == 200:
                try:
                    res_json = json.loads(response_body)
                    parts = res_json.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                    text_part = next((p.get("text") for p in parts if p.get("text")), None)

                    if not text_part:
                        raise ValueError("No text content returned from Gemini model")

                    # Strip any markdown code fences if present
                    clean_text = (
                        text_part.replace("```json", "")
                        .replace("```", "")
                        .strip()
                    )
                    parsed_dict = json.loads(clean_text)

                    logger.info(f"Successfully extracted receipt using model: {model}")
                    return parsed_dict, model
                except Exception as parse_err:
                    logger.warning(f"Failed to parse JSON from {model}: {str(parse_err)}")
                    last_error = f"Invalid JSON returned from model {model}"
                    break  # Try next model

            elif status_code == 503:
                # Exponential backoff retry on 503 Service Unavailable
                if attempt < len(RETRY_DELAYS):
                    delay = RETRY_DELAYS[attempt]
                    logger.warning(f"Model {model} returned 503. Retrying in {delay}s (Attempt {attempt + 1}/3)...")
                    time.sleep(delay)
                    continue
                else:
                    logger.warning(f"Model {model} exhausted all 503 retries. Moving to next fallback model.")
                    last_error = f"Model {model} returned 503 Service Unavailable"
                    break

            elif status_code == 404:
                logger.warning(f"Model {model} returned 404 (model not found). Moving to next fallback model.")
                last_error = f"Model {model} not found (404)"
                break

            else:
                logger.warning(f"Model {model} returned HTTP {status_code}: {response_body[:200]}")
                last_error = f"Model {model} returned error {status_code}"
                break

    # If all models exhausted
    logger.error(f"All Gemini Vision models failed. Last error: {last_error}")
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="The Gemini Vision OCR service is currently unavailable. Please try again in a few moments.",
    )
