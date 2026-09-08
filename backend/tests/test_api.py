"""
Automated unit & integration tests for SplitBill FastAPI Backend.
Tests:
- /api/health endpoint
- /api/split/calculate mathematical precision and zero-discrepancy reconciliation
- Zero GST, high discounts, 3-way splits, and edge cases
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Verify GET /api/health returns 200 OK with service metadata."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "SplitBill API"
    assert "version" in data


def test_split_calculate_exact_reconciliation_3_way():
    """Test 3-way split on an odd total item (e.g. 100 / 3) with taxes and discounts.
    Grand total must match sum(finalAmounts) to the exact cent/paisa with zero discrepancy.
    """
    payload = {
        "items": [
            {
                "id": "item-1",
                "name": "Wood-Fired Truffle Funghi Pizza",
                "quantity": 1,
                "unitPrice": 100.0,
                "totalPrice": 100.0,
                "category": "Mains",
            },
            {
                "id": "item-2",
                "name": "Artisanal Mint Mojito",
                "quantity": 2,
                "unitPrice": 150.0,
                "totalPrice": 300.0,
                "category": "Drinks",
            },
        ],
        "charges": {
            "subtotal": 400.0,
            "gst": 20.0,
            "serviceCharge": 40.0,
            "discount": 10.0,
            "grandTotal": 450.0,
        },
        "participants": [
            {"id": "p-1", "name": "Jayesh", "isYou": True, "color": "#16A34A"},
            {"id": "p-2", "name": "Aditi", "isYou": False, "color": "#3B82F6"},
            {"id": "p-3", "name": "Rohan", "isYou": False, "color": "#EF4444"},
        ],
        "assignments": {
            "item-1": ["p-1", "p-2", "p-3"],  # 100 split 3 ways (33.33 each)
            "item-2": ["p-1", "p-2"],          # 300 split 2 ways (150 each)
        },
    }

    response = client.post("/api/split/calculate", json=payload)
    assert response.status_code == 200
    res = response.json()

    assert res["success"] is True
    participants = res["participants"]
    assert len(participants) == 3

    allocation = res["allocation"]
    assert allocation["grandTotal"] == 450.0
    assert allocation["allocatedAmount"] == 450.0
    assert allocation["remainingAmount"] == 0.0
    assert allocation["isBalanced"] is True
    assert allocation["assignedItemsCount"] == 2
    assert allocation["unassignedItemsCount"] == 0
    assert allocation["percentageAllocated"] == 100

    # Verify sum of finalAmounts == 450.00 exactly
    total_participant_sum = round(sum(p["finalAmount"] for p in participants), 2)
    assert total_participant_sum == 450.0


def test_split_calculate_zero_gst_and_discounts():
    """Test bill calculation when GST and service charges are 0."""
    payload = {
        "items": [
            {
                "id": "item-1",
                "name": "Filter Coffee",
                "quantity": 2,
                "unitPrice": 40.0,
                "totalPrice": 80.0,
            }
        ],
        "charges": {
            "subtotal": 80.0,
            "gst": 0.0,
            "serviceCharge": 0.0,
            "discount": 0.0,
            "grandTotal": 80.0,
        },
        "participants": [
            {"id": "p-1", "name": "Aarav"},
            {"id": "p-2", "name": "Diya"},
        ],
        "assignments": {
            "item-1": ["p-1", "p-2"],
        },
    }

    response = client.post("/api/split/calculate", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["allocation"]["allocatedAmount"] == 80.0
    assert res["allocation"]["remainingAmount"] == 0.0
    assert res["allocation"]["isBalanced"] is True


def test_receipt_extract_invalid_file_type():
    """Verify POST /api/receipt/extract returns 400 for non-image uploads."""
    files = {"file": ("test.txt", b"This is a text file, not an image.", "text/plain")}
    response = client.post("/api/receipt/extract", files=files)
    assert response.status_code == 400
