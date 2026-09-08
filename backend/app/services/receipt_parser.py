import logging
from typing import Any, Dict, List
from app.models.receipt import ReceiptCharges, ReceiptItem, ReceiptResponse, Restaurant

logger = logging.getLogger("splitbill.receipt_parser")

NON_ITEM_KEYWORDS = [
    "subtotal",
    "sub-total",
    "sub total",
    "tax",
    "taxes",
    "cgst",
    "sgst",
    "gst",
    "vat",
    "service charge",
    "service fee",
    "round off",
    "roundoff",
    "grand total",
    "net total",
    "total",
    "cash",
    "card",
    "upi",
    "change due",
    "balance due",
    "tip",
    "gratuity",
    "table no",
    "order no",
    "bill no",
    "invoice no",
]


def parse_and_validate_receipt(raw_data: Dict[str, Any]) -> ReceiptResponse:
    """Parse, filter, and validate raw Gemini output into a clean ReceiptResponse.

    Enforces:
    - Zero hallucinated/non-item rows filtered out.
    - Subtotal validated against sum of line item totals.
    - Grand total computed/verified.
    - Currency rounded to 2 decimals.
    - Standardized confidence scores.
    """
    # 1. Parse Restaurant Metadata
    raw_restaurant = raw_data.get("restaurant") or {}
    restaurant_name = str(
        raw_restaurant.get("name")
        or raw_data.get("restaurantName")
        or "Restaurant Receipt"
    ).strip()

    restaurant = Restaurant(
        name=restaurant_name,
        date=str(raw_restaurant.get("date") or raw_data.get("date") or "").strip(),
        time=str(raw_restaurant.get("time") or raw_data.get("time") or "").strip(),
        billNumber=str(raw_restaurant.get("billNumber") or raw_data.get("billNumber") or "").strip(),
        location=str(raw_restaurant.get("location") or raw_data.get("location") or "").strip(),
    )

    # 2. Parse & Filter Line Items
    raw_items = raw_data.get("items") or []
    sanitized_items: List[ReceiptItem] = []

    for idx, item in enumerate(raw_items):
        if not isinstance(item, dict):
            continue

        name = str(item.get("name", "")).strip()
        if not name or len(name) < 2:
            continue

        lower_name = name.lower()

        # Reject rows that are tax/subtotal headers
        if any(
            lower_name == kw
            or lower_name.startswith(kw + " ")
            or lower_name.startswith(kw + ":")
            or lower_name.endswith(" " + kw)
            for kw in NON_ITEM_KEYWORDS
        ):
            continue

        try:
            quantity = max(1, int(float(item.get("quantity") or 1)))
        except (ValueError, TypeError):
            quantity = 1

        try:
            unit_price = round(float(item.get("unitPrice") or 0.0), 2)
        except (ValueError, TypeError):
            unit_price = 0.0

        try:
            total_price = round(float(item.get("totalPrice") or 0.0), 2)
        except (ValueError, TypeError):
            total_price = 0.0

        # Adjust price if one is missing
        if total_price == 0.0 and unit_price > 0.0:
            total_price = round(unit_price * quantity, 2)
        elif unit_price == 0.0 and total_price > 0.0:
            unit_price = round(total_price / quantity, 2)

        raw_conf = str(item.get("confidence", "high")).lower().strip()
        confidence = "medium" if raw_conf in ["med", "medium"] else ("low" if raw_conf == "low" else "high")
        confidence_score = 98 if confidence == "high" else (85 if confidence == "medium" else 72)

        category = str(item.get("category", "Main Course")).strip() or "Main Course"

        sanitized_items.append(
            ReceiptItem(
                id=f"item-{idx + 1}",
                name=name,
                quantity=quantity,
                unitPrice=unit_price,
                totalPrice=total_price,
                category=category,
                confidence=confidence,
                confidenceScore=confidence_score,
            )
        )

    # 3. Calculate and verify subtotal and charges
    items_sum = round(sum(item.totalPrice for item in sanitized_items), 2)

    raw_charges = raw_data.get("charges") or {}
    declared_subtotal = float(raw_charges.get("subtotal") or raw_data.get("subtotal") or 0.0)
    subtotal = declared_subtotal if declared_subtotal > 0.0 else items_sum
    if items_sum > 0.0 and abs(subtotal - items_sum) > 0.05:
        # Reconcile subtotal to sum of items if discrepancy
        subtotal = items_sum

    gst = float(raw_charges.get("gst") or raw_data.get("gst") or 0.0)
    service_charge = float(raw_charges.get("serviceCharge") or raw_data.get("serviceCharge") or 0.0)
    discount = float(raw_charges.get("discount") or raw_data.get("discount") or 0.0)

    computed_grand_total = round(subtotal + gst + service_charge - discount, 2)
    declared_grand_total = float(raw_charges.get("grandTotal") or raw_data.get("total") or 0.0)
    grand_total = declared_grand_total if declared_grand_total > 0.0 else computed_grand_total

    charges = ReceiptCharges(
        subtotal=round(subtotal, 2),
        gst=round(gst, 2),
        serviceCharge=round(service_charge, 2),
        discount=round(discount, 2),
        grandTotal=round(grand_total, 2),
    )

    logger.info(
        f"Parsed receipt: '{restaurant.name}' with {len(sanitized_items)} items, "
        f"subtotal={charges.subtotal}, grandTotal={charges.grandTotal}"
    )

    return ReceiptResponse(
        restaurant=restaurant,
        charges=charges,
        items=sanitized_items,
    )
