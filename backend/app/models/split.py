from typing import Dict, List, Optional
from pydantic import BaseModel, Field, field_validator
from .receipt import ReceiptCharges, ReceiptItem, Restaurant


class Participant(BaseModel):
    """Participant in the dining session."""
    id: str = Field(..., description="Unique participant ID")
    name: str = Field(..., min_length=1, description="Participant name")
    color: Optional[str] = Field(default="#16A34A", description="Avatar display color")
    avatarInitials: Optional[str] = Field(default="", description="Initials for avatar")
    isYou: Optional[bool] = Field(default=False, description="Whether this participant is the organizer / current user")


class Assignment(BaseModel):
    """Item assignment to participant IDs."""
    itemId: str
    participantIds: List[str] = Field(default_factory=list)


class SplitRequest(BaseModel):
    """Input payload for bill split calculation."""
    receipt: Optional[Dict] = None
    items: List[ReceiptItem] = Field(default_factory=list, description="List of items on the bill")
    charges: ReceiptCharges = Field(..., description="Bill charges and subtotal/tax summary")
    participants: List[Participant] = Field(..., min_length=1, description="List of diners")
    assignments: Dict[str, List[str]] = Field(
        default_factory=dict,
        description="Mapping of item ID -> array of participant IDs who shared it",
    )


class ParticipantSplitItem(BaseModel):
    """Item breakdown assigned to a specific participant."""
    itemId: str
    name: str
    shareFraction: str
    shareAmount: float


class ParticipantSplitBreakdown(BaseModel):
    """Calculated financial breakdown for a participant."""
    id: str = Field(..., description="Participant ID")
    name: str = Field(..., description="Participant Name")
    initials: Optional[str] = Field(default="")
    color: Optional[str] = Field(default="#16A34A")
    isYou: Optional[bool] = Field(default=False)
    foodSubtotal: float = Field(default=0.0, description="Diner's food & beverage subtotal")
    gstShare: float = Field(default=0.0, description="Proportional GST allocation")
    serviceChargeShare: float = Field(default=0.0, description="Proportional service charge allocation")
    discountShare: float = Field(default=0.0, description="Proportional discount allocation")
    finalAmount: float = Field(default=0.0, description="Final payable amount (reconciled)")
    items: List[ParticipantSplitItem] = Field(default_factory=list, description="Dishes shared by this diner")
    percentageOfBill: Optional[float] = Field(default=0.0, description="Percentage of total bill")

    @field_validator("foodSubtotal", "gstShare", "serviceChargeShare", "discountShare", "finalAmount", mode="before")
    @classmethod
    def round_values(cls, v):
        try:
            return round(float(v), 2)
        except (ValueError, TypeError):
            return 0.0


class AllocationSummary(BaseModel):
    """Ledger allocation and reconciliation statistics."""
    allocatedAmount: float = Field(default=0.0, description="Sum of all diner final amounts")
    remainingAmount: float = Field(default=0.0, description="Difference against grand total (0.00 when balanced)")
    grandTotal: float = Field(default=0.0, description="Original bill grand total")
    isBalanced: bool = Field(default=True, description="True if mathematically zero discrepancy")
    totalItems: int = Field(default=0)
    assignedItemsCount: int = Field(default=0)
    unassignedItemsCount: int = Field(default=0)
    percentageAllocated: int = Field(default=100)


class SplitResponse(BaseModel):
    """Output response from split calculation engine."""
    success: bool = Field(default=True)
    participants: List[ParticipantSplitBreakdown]
    allocation: AllocationSummary
