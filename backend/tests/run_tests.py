import sys
from pathlib import Path

# Ensure backend root is in sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def run_all_tests():
    print("--- Running SplitBill Backend Automated QA Tests ---")

    # 1. Health Endpoint Test
    print("Test 1: Health check endpoint...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health failed with {res.status_code}"
    data = res.json()
    assert data["status"] == "ok", "Status is not ok"
    assert data["service"] == "SplitBill API", "Service name mismatch"
    print("  [PASS] Health check passed (HTTP 200, status=ok)")

    # 2. 3-Way Split with Remainder Reconciliation
    print("Test 2: 3-way split with GST, service charge, and discounts...")
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
    res = client.post("/api/split/calculate", json=payload)
    assert res.status_code == 200, f"Split calculate failed: {res.text}"
    split_data = res.json()
    assert split_data["success"] is True

    alloc = split_data["allocation"]
    assert alloc["grandTotal"] == 450.0
    assert alloc["allocatedAmount"] == 450.0
    assert alloc["remainingAmount"] == 0.0
    assert alloc["isBalanced"] is True
    assert alloc["assignedItemsCount"] == 2
    assert alloc["unassignedItemsCount"] == 0
    assert alloc["percentageAllocated"] == 100

    participants = split_data["participants"]
    total_sum = round(sum(p["finalAmount"] for p in participants), 2)
    assert total_sum == 450.0, f"Expected 450.0, got {total_sum}"
    print("  [PASS] Split precision & remainder reconciliation passed (allocated=450.00, remaining=0.00, balanced=True)")

    # 3. Zero GST & Edge Cases
    print("Test 3: Zero GST and direct split...")
    payload_zero = {
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
    res = client.post("/api/split/calculate", json=payload_zero)
    assert res.status_code == 200
    res_zero = res.json()
    assert res_zero["allocation"]["remainingAmount"] == 0.0
    assert res_zero["allocation"]["isBalanced"] is True
    print("  [PASS] Zero GST split passed")

    # 4. Invalid Upload Rejection
    print("Test 4: Reject non-image upload...")
    files = {"file": ("test.txt", b"Invalid text content", "text/plain")}
    res = client.post("/api/receipt/extract", files=files)
    assert res.status_code == 400
    print("  [PASS] Non-image upload correctly rejected with HTTP 400")

    print("\n[SUCCESS] ALL BACKEND QA TESTS PASSED SUCCESSFULLY!")


if __name__ == "__main__":
    run_all_tests()
