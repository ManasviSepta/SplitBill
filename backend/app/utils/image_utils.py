import io
import logging
from typing import Tuple
from fastapi import HTTPException, UploadFile, status
from PIL import Image
from app.config import settings

logger = logging.getLogger("splitbill.image_utils")


def bytes_to_mime_type(content: bytes) -> str:
    """Determine MIME type from image bytes header."""
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    elif content.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    elif content.startswith(b"RIFF") and content[8:12] == b"WEBP":
        return "image/webp"
    return "image/jpeg"


async def validate_image_upload(file: UploadFile) -> Tuple[bytes, str]:
    """Validate uploaded receipt file for size, MIME type, and image integrity.

    Returns:
        Tuple of (image_bytes, mime_type)
    Raises:
        HTTPException (400) if file is invalid or corrupt.
    """
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided. Please upload a receipt image.",
        )

    # Read content
    content = await file.read()
    file_size = len(content)

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty. Please select a valid receipt image.",
        )

    if file_size > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB.",
        )

    # Validate MIME type from content header or file.content_type
    detected_mime = bytes_to_mime_type(content)
    declared_mime = (file.content_type or "").lower()

    valid_mimes = settings.ALLOWED_MIME_TYPES
    if detected_mime not in valid_mimes and declared_mime not in valid_mimes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{declared_mime or detected_mime}'. Supported formats: PNG, JPEG, JPG, WEBP.",
        )

    final_mime = detected_mime if detected_mime in valid_mimes else declared_mime

    # Verify image integrity with Pillow
    try:
        with Image.open(io.BytesIO(content)) as img:
            img.verify()
    except Exception as e:
        logger.warning(f"Corrupt image upload rejected: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded image file is corrupt or unreadable. Please upload a clear photo of your receipt.",
        )

    return content, final_mime
