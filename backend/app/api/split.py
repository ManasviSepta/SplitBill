import logging
from fastapi import APIRouter, HTTPException, status
from app.models.split import SplitRequest, SplitResponse
from app.services.split_service import calculate_bill_split

router = APIRouter(prefix="/split", tags=["Split Engine"])
logger = logging.getLogger("splitbill.api.split")


@router.post(
    "/calculate",
    response_model=SplitResponse,
    summary="Calculate exact proportional bill split for participants",
)
async def calculate_split(req: SplitRequest):
    """Calculate participant payment breakdown based on items eaten and proportional tax/discount distribution."""
    logger.info(f"Split calculation requested for {len(req.participants)} participants and {len(req.items)} items")

    if not req.participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one participant is required to calculate a bill split.",
        )

    try:
        response = calculate_bill_split(req)
        return response
    except Exception as e:
        logger.error(f"Error computing bill split: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during split calculations: {str(e)}",
        )
