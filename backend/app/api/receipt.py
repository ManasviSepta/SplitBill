import logging
from fastapi import APIRouter, File, HTTPException, UploadFile, status
from app.models.receipt import ReceiptExtractResponse
from app.services.gemini_service import extract_receipt_with_gemini
from app.services.receipt_parser import parse_and_validate_receipt
from app.utils.image_utils import validate_image_upload

router = APIRouter(prefix="/receipt", tags=["Receipt"])
logger = logging.getLogger("splitbill.api.receipt")


@router.post(
    "/extract",
    response_model=ReceiptExtractResponse,
    summary="Extract receipt items and bill summary using Gemini Vision",
)
async def extract_receipt(file: UploadFile = File(...)):
    """Upload a receipt image and extract structured items, taxes, and totals using Gemini Vision OCR.

    - Accepted formats: PNG, JPEG, JPG, WEBP.
    - Max size: 10 MB.
    - Returns structured JSON validated against Pydantic models.
    """
    logger.info(f"Received receipt extraction request: {file.filename} ({file.content_type})")

    # 1. Validate image upload & obtain clean image bytes
    image_bytes, mime_type = await validate_image_upload(file)

    # 2. Extract raw data using Gemini Vision with model fallback
    try:
        raw_data, model_used = extract_receipt_with_gemini(image_bytes, mime_type)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error calling Gemini service: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while analyzing the receipt image. Please try again.",
        )

    # 3. Parse and sanitize extracted receipt data
    try:
        validated_receipt = parse_and_validate_receipt(raw_data)
    except Exception as e:
        logger.error(f"Error parsing receipt structure: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Could not parse receipt contents into standard schema. Please upload a clearer photo.",
        )

    if not validated_receipt.items and validated_receipt.charges.grandTotal == 0:
        logger.warning("No readable items or charges found on the receipt image.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No legible receipt items could be found in this image. Please upload a well-lit photo of your receipt.",
        )

    logger.info(f"Extraction successful: {len(validated_receipt.items)} items extracted via {model_used}")

    return ReceiptExtractResponse(
        success=True,
        data=validated_receipt,
        modelUsed=model_used,
        error=None,
    )
