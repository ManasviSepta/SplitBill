# SplitBill — FastAPI Backend

Modular, production-ready Python FastAPI backend for **SplitBill**, providing AI-powered receipt OCR via Gemini Vision and an exact proportional bill split calculation engine.

---

## Features

- **Gemini Vision OCR (`POST /api/receipt/extract`)**: Strict multi-model fallback (`gemini-2.5-flash` → `gemini-2.5-pro` → `gemini-1.5-flash` → `gemini-flash-latest`) with exponential backoff on HTTP 503 and zero hallucination enforcement.
- **Receipt Parser & Validator**: Reconciles item sum against subtotal, standardizes confidence scores (`high`, `medium`, `low`), and rounds currency to 2 decimal places.
- **Proportional Split Engine (`POST /api/split/calculate`)**: Mathematically exact diner breakdown with proportional distribution of GST, service fees, and discounts, eliminating rounding discrepancy.
- **Health Check (`GET /api/health`)**: Service status and uptime verification.
- **CORS Configured**: Plug-and-play with React Vite frontend.

---

## Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI entrypoint, middleware & router mounts
│   ├── config.py             # Environment settings loader
│   ├── api/
│   │   ├── __init__.py
│   │   ├── health.py         # GET /api/health
│   │   ├── receipt.py        # POST /api/receipt/extract
│   │   └── split.py          # POST /api/split/calculate
│   ├── services/
│   │   ├── __init__.py
│   │   ├── gemini_service.py # Gemini Vision integration with model fallback
│   │   ├── receipt_parser.py # Item filtering and schema validator
│   │   └── split_service.py  # Proportional allocation calculation engine
│   ├── models/
│   │   ├── __init__.py
│   │   ├── receipt.py        # Pydantic schemas for receipt extraction
│   │   └── split.py          # Pydantic schemas for split request & response
│   └── utils/
│       ├── __init__.py
│       └── image_utils.py    # MIME & size validation, PIL verification
├── uploads/                  # Temporary image storage directory
├── .env.example              # Environment variables template
├── requirements.txt          # Python dependencies
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- Python 3.10+ (Python 3.11 or 3.12 recommended)
- Google Gemini API Key ([Get a free key at Google AI Studio](https://aistudio.google.com/app/apikey))

### 2. Create Virtual Environment

```bash
cd backend
python -m venv venv

# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# On Windows (Command Prompt):
.\venv\Scripts\activate.bat

# On macOS / Linux:
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and set your `GEMINI_API_KEY`:

```bash
cp .env.example .env
```

Edit `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### 5. Run the Server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API Base**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Docs**: `http://localhost:8000/redoc`

---

## API Endpoints

### 1. `GET /api/health`
Health check endpoint.
- **Response**:
  ```json
  {
    "status": "ok",
    "service": "SplitBill API",
    "version": "1.0.0",
    "timestamp": "2026-09-08T18:00:00.000000+00:00"
  }
  ```

### 2. `POST /api/receipt/extract`
Upload a receipt image and extract structured items and bill totals.
- **Content-Type**: `multipart/form-data`
- **Field**: `file` (PNG, JPG, JPEG, WEBP; max 10MB)
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "restaurant": {
        "name": "Bawarchi Restaurant",
        "date": "2026-09-08",
        "time": "14:20",
        "billNumber": "INV-1092",
        "location": "Hyderabad"
      },
      "charges": {
        "subtotal": 2400.0,
        "gst": 120.0,
        "serviceCharge": 100.0,
        "discount": 0.0,
        "grandTotal": 2620.0
      },
      "items": [
        {
          "name": "Chicken Biryani",
          "quantity": 2,
          "unitPrice": 450.0,
          "totalPrice": 900.0,
          "category": "Main Course",
          "confidence": "high",
          "confidenceScore": 98
        }
      ]
    },
    "modelUsed": "gemini-2.5-flash"
  }
  ```

### 3. `POST /api/split/calculate`
Calculate exact proportional bill split for participants based on assigned items.
- **Content-Type**: `application/json`
- **Payload**:
  ```json
  {
    "items": [
      { "id": "item-1", "name": "Biryani", "quantity": 2, "unitPrice": 450.0, "totalPrice": 900.0 }
    ],
    "charges": {
      "subtotal": 900.0,
      "gst": 45.0,
      "serviceCharge": 45.0,
      "discount": 0.0,
      "grandTotal": 990.0
    },
    "participants": [
      { "id": "p-1", "name": "Aarav", "color": "#16A34A", "isYou": true },
      { "id": "p-2", "name": "Priya", "color": "#3B82F6", "isYou": false }
    ],
    "assignments": {
      "item-1": ["p-1", "p-2"]
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "participants": [
      {
        "id": "p-1",
        "name": "Aarav",
        "foodSubtotal": 450.0,
        "gstShare": 22.5,
        "serviceChargeShare": 22.5,
        "discountShare": 0.0,
        "finalAmount": 495.0,
        "items": [
          { "itemId": "item-1", "name": "Biryani", "shareFraction": "1/2 share", "shareAmount": 450.0 }
        ],
        "percentageOfBill": 50.0
      }
    ],
    "allocation": {
      "allocatedAmount": 990.0,
      "remainingAmount": 0.0,
      "grandTotal": 990.0,
      "isBalanced": true,
      "totalItems": 1,
      "assignedItemsCount": 1,
      "unassignedItemsCount": 0,
      "percentageAllocated": 100
    }
  }
  ```
