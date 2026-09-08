import logging
from typing import Dict, List
from app.models.split import (
    AllocationSummary,
    ParticipantSplitBreakdown,
    ParticipantSplitItem,
    SplitRequest,
    SplitResponse,
)

logger = logging.getLogger("splitbill.split_service")


def calculate_bill_split(req: SplitRequest) -> SplitResponse:
    """Execute precision proportional bill split algorithm.

    Rules:
    1. For each item: divide cost equally among assigned diners.
    2. Sum each participant's food subtotal.
    3. Calculate proportional share ratio = participant_subtotal / total_food_subtotal.
    4. Proportionally allocate GST, Service Charge, and Discounts.
    5. Compute finalAmount = foodSubtotal + gstShare + serviceChargeShare - discountShare.
    6. Reconcile exact sum against grandTotal:
       If rounding difference (e.g. ±0.01/0.02) exists, adjust the highest share diner so
       allocatedAmount == grandTotal exactly with 0 discrepancy.
    """
    participants = req.participants
    items = req.items
    charges = req.charges
    assignments = req.assignments

    if not participants:
        return SplitResponse(
            success=False,
            participants=[],
            allocation=AllocationSummary(
                allocatedAmount=0.0,
                remainingAmount=charges.grandTotal,
                grandTotal=charges.grandTotal,
                isBalanced=False,
                totalItems=len(items),
                assignedItemsCount=0,
                unassignedItemsCount=len(items),
                percentageAllocated=0,
            ),
        )

    # Participant subtotal and assigned items accumulator
    participant_food_subtotals: Dict[str, float] = {p.id: 0.0 for p in participants}
    participant_items_map: Dict[str, List[ParticipantSplitItem]] = {p.id: [] for p in participants}

    assigned_items_count = 0

    for item in items:
        assigned_diner_ids = assignments.get(str(item.id), [])
        # Also check fallback string match or empty
        if not assigned_diner_ids and str(item.id) in assignments:
            assigned_diner_ids = assignments[str(item.id)]

        valid_diners = [d_id for d_id in assigned_diner_ids if d_id in participant_food_subtotals]

        if valid_diners:
            assigned_items_count += 1
            num_diners = len(valid_diners)
            share_amount = round(item.totalPrice / num_diners, 2)
            share_fraction = "1x" if num_diners == 1 else f"1/{num_diners} share"

            for d_id in valid_diners:
                participant_food_subtotals[d_id] += share_amount
                participant_items_map[d_id].append(
                    ParticipantSplitItem(
                        itemId=str(item.id or ""),
                        name=item.name,
                        shareFraction=share_fraction,
                        shareAmount=share_amount,
                    )
                )

    total_food_subtotal = round(sum(participant_food_subtotals.values()), 2)
    # If no items assigned or total is 0, use bill subtotal as base
    effective_base_subtotal = total_food_subtotal if total_food_subtotal > 0 else (charges.subtotal or 1.0)

    breakdowns: List[ParticipantSplitBreakdown] = []

    for p in participants:
        p_subtotal = round(participant_food_subtotals.get(p.id, 0.0), 2)
        ratio = (p_subtotal / effective_base_subtotal) if effective_base_subtotal > 0 else 0.0

        gst_share = round(charges.gst * ratio, 2)
        service_share = round(charges.serviceCharge * ratio, 2)
        discount_share = round(charges.discount * ratio, 2)

        raw_final = round(p_subtotal + gst_share + service_share - discount_share, 2)
        final_amount = max(0.0, raw_final)

        percentage_of_bill = round(ratio * 100, 1)

        breakdowns.append(
            ParticipantSplitBreakdown(
                id=p.id,
                name=p.name,
                initials=p.avatarInitials or (p.name[:2].upper() if len(p.name) >= 2 else p.name.upper()),
                color=p.color or "#16A34A",
                isYou=p.isYou or False,
                foodSubtotal=p_subtotal,
                gstShare=gst_share,
                serviceChargeShare=service_share,
                discountShare=discount_share,
                finalAmount=final_amount,
                items=participant_items_map.get(p.id, []),
                percentageOfBill=percentage_of_bill,
            )
        )

    # 6. Reconcile exact sum against grandTotal
    allocated_sum = round(sum(b.finalAmount for b in breakdowns), 2)
    target_grand_total = charges.grandTotal

    rounding_diff = round(target_grand_total - allocated_sum, 2)

    # Adjust rounding difference on highest subtotal participant when all assigned items are processed
    if breakdowns and abs(rounding_diff) > 0.0 and abs(rounding_diff) < 5.0 and total_food_subtotal > 0 and assigned_items_count == len(items):
        # Find participant with highest subtotal
        highest_p = max(breakdowns, key=lambda b: b.foodSubtotal)
        highest_p.finalAmount = round(highest_p.finalAmount + rounding_diff, 2)
        allocated_sum = round(sum(b.finalAmount for b in breakdowns), 2)
        rounding_diff = round(target_grand_total - allocated_sum, 2)
        logger.info(f"Reconciled rounding difference on participant {highest_p.name}, final sum={allocated_sum}")

    remaining_raw = round(target_grand_total - allocated_sum, 2)
    remaining_amount = 0.0 if (abs(remaining_raw) < 0.01 or (assigned_items_count == len(items) and len(items) > 0)) else max(0.0, remaining_raw)
    is_balanced = (remaining_amount == 0.0) or (abs(target_grand_total - allocated_sum) < 0.01)

    total_items = len(items)
    unassigned_items_count = total_items - assigned_items_count
    pct_allocated = round((assigned_items_count / total_items) * 100) if total_items > 0 else 100

    allocation_summary = AllocationSummary(
        allocatedAmount=allocated_sum,
        remainingAmount=remaining_amount,
        grandTotal=target_grand_total,
        isBalanced=is_balanced,
        totalItems=total_items,
        assignedItemsCount=assigned_items_count,
        unassignedItemsCount=unassigned_items_count,
        percentageAllocated=pct_allocated,
    )

    logger.info(f"Split calculation completed: {len(breakdowns)} diners, allocated={allocated_sum}/{target_grand_total}")

    return SplitResponse(
        success=True,
        participants=breakdowns,
        allocation=allocation_summary,
    )
