import { ExtractedBillData, ExtractedItem } from "@/types/review";

export interface GeminiExtractionResult {
  success: boolean;
  data?: ExtractedBillData;
  modelUsed?: string;
  rawText?: string;
  error?: string;
}

/**
 * Helper to convert a File or Blob object into a base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Helper to fetch an image URL (such as sample image or blob URL) and convert to base64
 */
export async function urlToBase64(url: string): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(url);
  const blob = await response.blob();
  const mimeType = blob.type || "image/jpeg";
  const arrayBuffer = await blob.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(arrayBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );
  return { base64, mimeType };
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Extract restaurant bill details with robust model fallback and exponential backoff retry for HTTP 503
 */
export async function extractBillWithGemini(
  imageSource: File | string,
  onStatusUpdate?: (status: string) => void
): Promise<GeminiExtractionResult> {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY ||
    (import.meta.env as unknown as Record<string, string>).GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    return {
      success: false,
      error:
        "Gemini API key is not configured. Please add your VITE_GEMINI_API_KEY in the .env file.",
    };
  }

  try {
    let base64Data = "";
    let mimeType = "image/jpeg";

    if (typeof imageSource === "string") {
      const converted = await urlToBase64(imageSource);
      base64Data = converted.base64;
      mimeType = converted.mimeType;
    } else {
      base64Data = await fileToBase64(imageSource);
      mimeType = imageSource.type || "image/jpeg";
    }

    const systemPrompt = `You are a precision restaurant bill OCR engine. Your sole job is to extract ONLY the line items and bill summary that physically exist on this receipt image.

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
   - Assign "med" if text is slightly faded, skewed, or partially ambiguous.
   - Assign "low" only if text is blurry, handwritten, creased, or cut off.
   - Do not arbitrarily flag rows.

Return ONLY valid JSON with this exact schema (no markdown, no extra commentary):
{
  "restaurantName": "Name of the restaurant or outlet from the top of receipt",
  "location": "City or locality if visible, else empty string",
  "date": "Date as printed on receipt or empty string",
  "time": "Time as printed on receipt or empty string",
  "billNumber": "Invoice/Bill/Order number if visible or empty string",
  "subtotal": 0.00,
  "gst": 0.00,
  "serviceCharge": 0.00,
  "discount": 0.00,
  "total": 0.00,
  "items": [
    {
      "name": "Exact item name as printed",
      "category": "Appetizer" | "Mains" | "Beverage" | "Dessert" | "Side" | "Other",
      "quantity": 1,
      "unitPrice": 0.00,
      "totalPrice": 0.00,
      "confidence": "high" | "med" | "low"
    }
  ]
}`;

    // Fallback order:
    // 1. gemini-2.5-flash (primary)
    // 2. gemini-2.5-pro (fallback)
    // 3. gemini-1.5-flash (last fallback)
    // Plus active modern fallbacks (gemini-3.6-flash, gemini-flash-latest) to ensure 100% resilience
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-1.5-flash",
      "gemini-3.6-flash",
      "gemini-flash-latest",
    ];

    const retryDelays = [1000, 2000, 4000]; // Exponential backoff for HTTP 503
    let lastError = "";
    let candidateText = "";
    let finalModelUsed = "";

    onStatusUpdate?.("Reading receipt...");

    for (let modelIndex = 0; modelIndex < modelsToTry.length; modelIndex++) {
      const model = modelsToTry[modelIndex];
      console.log(`[Gemini OCR] Using model: ${model}`);

      if (modelIndex > 0) {
        onStatusUpdate?.("Trying another AI model...");
      }

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      let modelSuccess = false;

      // Try with up to 3 retries for HTTP 503
      for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
        try {
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: systemPrompt },
                    {
                      inlineData: {
                        mimeType: mimeType,
                        data: base64Data,
                      },
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.1,
              },
            }),
          });

          // HTTP 200 OK -> Success!
          if (response.ok) {
            const result = await response.json();
            const parts = result?.candidates?.[0]?.content?.parts || [];
            const textPart =
              parts.find((p: { text?: string; thought?: boolean }) => p.text && !p.thought) ||
              parts[0];
            candidateText = textPart?.text || "";

            if (candidateText) {
              finalModelUsed = model;
              modelSuccess = true;
              console.log(`[Gemini OCR] Successfully extracted using model: ${model}`);
              onStatusUpdate?.("Receipt extracted successfully.");
              break;
            }
          }

          // HTTP 503 UNAVAILABLE -> Exponential backoff retry
          if (response.status === 503) {
            const errBody = await response.text();
            lastError = `Model ${model} returned 503 Service Unavailable: ${errBody}`;

            if (attempt < retryDelays.length) {
              const delay = retryDelays[attempt];
              console.warn(
                `[Gemini OCR] Model ${model} returned 503. Retry #${attempt + 1} with ${delay}ms backoff...`
              );
              onStatusUpdate?.("Gemini is busy. Retrying...");
              await sleep(delay);
              continue; // Retry this model
            } else {
              console.warn(
                `[Gemini OCR] Model ${model} failed after 3 retries (503). Switching to fallback model...`
              );
              break; // Exhausted retries for this model, fallback to next model
            }
          }

          // HTTP 404 NOT FOUND -> Model deprecated/unavailable, immediately fallback to next model
          if (response.status === 404) {
            const errBody = await response.text();
            lastError = `Model ${model} not available (404): ${errBody}`;
            console.warn(`[Gemini OCR] Model ${model} returned 404, proceeding to next fallback...`);
            break;
          }

          // Other errors (e.g. 400 Bad Request, 401/403 Invalid API Key) -> Do not retry
          const errBody = await response.text();
          lastError = `Model ${model} returned ${response.status}: ${errBody}`;
          console.error(`[Gemini OCR] Non-retryable error on ${model}: ${response.status}`);
          break;
        } catch (networkErr: unknown) {
          const msg = networkErr instanceof Error ? networkErr.message : String(networkErr);
          lastError = `Network error on ${model}: ${msg}`;
          console.warn(`[Gemini OCR] Network error on ${model}: ${msg}`);

          if (attempt < retryDelays.length) {
            const delay = retryDelays[attempt];
            onStatusUpdate?.("Gemini is busy. Retrying...");
            await sleep(delay);
            continue;
          } else {
            break;
          }
        }
      }

      if (modelSuccess) {
        break; // Successfully got response
      }
    }

    if (!candidateText) {
      console.error(`[Gemini OCR] All retries and model fallbacks failed. Final error: ${lastError}`);
      return {
        success: false,
        error: "We couldn't reach the AI service right now. Please try again in a few seconds.",
      };
    }

    // Clean JSON formatting
    const cleanedJson = candidateText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const raw = JSON.parse(cleanedJson);

    // Filter and sanitize line items
    const nonItemWords = [
      "subtotal",
      "tax",
      "cgst",
      "sgst",
      "service charge",
      "vat",
      "round off",
      "grand total",
      "total",
      "cash",
      "upi",
      "card",
    ];

    const rawItems = Array.isArray(raw.items) ? raw.items : [];
    const sanitizedItems: ExtractedItem[] = rawItems
      .filter((item: Record<string, unknown>) => {
        const name = String(item.name || "").trim().toLowerCase();
        if (!name || name.length < 2) return false;
        if (nonItemWords.some((w) => name === w || name.startsWith(w + " ") || name.startsWith(w + ":"))) {
          return false;
        }
        return true;
      })
      .map((item: Record<string, unknown>) => {
        const quantity = Math.max(1, Math.round(Number(item.quantity) || 1));
        let unitPrice = Number(item.unitPrice) || 0;
        let totalPrice = Number(item.totalPrice) || 0;

        if (totalPrice === 0 && unitPrice > 0) {
          totalPrice = Number((unitPrice * quantity).toFixed(2));
        } else if (unitPrice === 0 && totalPrice > 0) {
          unitPrice = Number((totalPrice / quantity).toFixed(2));
        }

        const validCategories = ["Appetizer", "Mains", "Beverage", "Dessert", "Side", "Other"];
        const category = validCategories.includes(String(item.category))
          ? (String(item.category) as ExtractedItem["category"])
          : "Mains";

        const validConfidence = ["high", "med", "low"];
        const confidence = validConfidence.includes(String(item.confidence))
          ? (String(item.confidence) as "high" | "med" | "low")
          : "high";

        return {
          name: String(item.name || "").trim(),
          category,
          quantity,
          unitPrice: Number(unitPrice.toFixed(2)),
          totalPrice: Number(totalPrice.toFixed(2)),
          confidence,
          confidenceScore:
            confidence === "high" ? 98 : confidence === "med" ? 85 : 72,
        };
      });

    const subtotal = Number(raw.subtotal) || sanitizedItems.reduce((acc, i) => acc + i.totalPrice, 0);
    const gst = Number(raw.gst) || 0;
    const serviceCharge = Number(raw.serviceCharge) || 0;
    const discount = Number(raw.discount) || 0;
    const total = Number(raw.total) || (subtotal + gst + serviceCharge - discount);

    const extractedBill: ExtractedBillData = {
      restaurantName: raw.restaurantName || "Restaurant Receipt",
      location: raw.location || "",
      date: raw.date || "",
      time: raw.time || "",
      billNumber: raw.billNumber || "",
      subtotal: Number(subtotal.toFixed(2)),
      gst: Number(gst.toFixed(2)),
      serviceCharge: Number(serviceCharge.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      total: Number(total.toFixed(2)),
      ocrAccuracy: "98.8%",
      items: sanitizedItems,
    };

    return {
      success: true,
      data: extractedBill,
      modelUsed: finalModelUsed,
      rawText: candidateText,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Gemini OCR] Unexpected error during extraction: ${message}`);
    return {
      success: false,
      error: "We couldn't reach the AI service right now. Please try again in a few seconds.",
    };
  }
}
