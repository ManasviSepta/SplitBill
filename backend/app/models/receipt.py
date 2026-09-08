from typing import List, Literal, Optional
from pydantic import BaseModel, Field, field_validator


class Restaurant(BaseModel):
    """Extracted restaurant metadata."""
    name: str = Field(default="Restaurant Receipt", description="Name of the restaurant or dining establishment")
    date: Optional[str] = Field(default="", description="Date printed on receipt")
    time: Optional[str] = Field(default="", description="Time printed on receipt")
    billNumber: Optional[str] = Field(default="", description="Invoice or bill number if available")
    location: Optional[str] = Field(default="", description="City or locality if available")


class ReceiptCharges(BaseModel):
    """Extracted financial totals and surcharge breakdown."""
    subtotal: float = Field(default=0.0, description="Sum total of all purchased food and beverage items before tax")
    gst: float = Field(default=0.0, description="GST / VAT / Sales tax amount")
    serviceCharge: float = Field(default=0.0, description="Service charge or delivery / packaging fee")
    discount: float = Field(default=0.0, description="Discounts or coupon reductions")
    grandTotal: float = Field(default=0.0, description="Final total amount charged on receipt")

    @field_validator("subtotal", "gst", "serviceCharge", "discount", "grandTotal", mode="before")
    @classmethod
    def round_two_decimals(cls, v):
        try:
            return round(float(v), 2)
        except (ValueError, TypeError):
            return 0.0


class ReceiptItem(BaseModel):
    """Extracted line item from the receipt."""
    id: Optional[str] = Field(default=None, description="Optional unique identifier")
    name: str = Field(..., min_length=1, description="Exact name of the item as printed")
    quantity: int = Field(default=1, ge=1, description="Quantity ordered")
    unitPrice: float = Field(default=0.0, ge=0.0, description="Unit price per item")
    totalPrice: float = Field(default=0.0, ge=0.0, description="Total price for this line item")
    category: Optional[str] = Field(default="Main Course", description="Course category")
    confidence: Literal["high", "medium", "low"] = Field(default="high", description="OCR confidence classification")
    confidenceScore: Optional[int] = Field(default=98, ge=0, le=100, description="Confidence score out of 100")

    @field_validator("totalPrice", "unitPrice", mode="before")
    @classmethod
    def round_prices(cls, v):
        try:
            return round(float(v), 2)
        except (ValueError, TypeError):
            return 0.0

    @field_validator("confidence", mode="before")
    @classmethod
    def normalize_confidence(cls, v):
        val = str(v).lower().strip()
        if val in ["high", "med", "medium", "low"]:
            return "medium" if val in ["med", "medium"] else val
        return "high"


class ReceiptResponse(BaseModel):
    """Standardized receipt data schema."""
    restaurant: Restaurant
    charges: ReceiptCharges
    items: List[ReceiptItem] = Field(default_factory=list)


class ReceiptExtractResponse(BaseModel):
    """API Response schema for receipt extraction endpoint."""
    success: bool = Field(default=True)
    data: ReceiptResponse
    modelUsed: Optional[str] = Field(default=None)
    error: Optional[str] = Field(default=None)
