# SplitBill

**Split the bill. Not the friendship.**

SplitBill is an AI-powered restaurant receipt splitting application that uses Gemini Vision OCR and a Python FastAPI backend to calculate mathematically accurate participant payments.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Pydantic](https://img.shields.io/badge/Pydantic-v2.6-E92063?style=flat&logo=pydantic&logoColor=white)](https://docs.pydantic.dev/)
[![Gemini Vision](https://img.shields.io/badge/Gemini_Vision-OCR-8E75C2?style=flat&logo=google&logoColor=white)](https://ai.google.dev/)

---

## Features

- [x] **Upload Restaurant Receipt**: Drag & drop or browse photos of printed dining bills (JPG, PNG, WEBP).
- [x] **AI Receipt Extraction**: High-precision Gemini Vision OCR extracts item names, quantities, prices, taxes, and service charges.
- [x] **Review and Edit Extracted Bill**: Interactive editable table to verify prices, quantities, and adjust line items.
- [x] **Add Dining Companions Dynamically**: Add friends on the fly with personalized persistent avatar colors.
- [x] **Assign Dishes**: Tag individual diners or split shared dishes equally among multiple people with one tap.
- [x] **Proportional Distribution**: Mathematically sound allocation of GST, service charge, and discounts based on actual consumption.
- [x] **Individual Participant Billing Cards**: Clear breakdown showing each diner's dishes, tax share, and exact final amount.
- [x] **Organizer QR Upload**: Bill payer can upload their personal UPI QR code (GPay/PhonePe/Paytm) for instant reimbursement.
- [x] **Zero Discrepancy Reconciliation**: Automatic remainder balancing ensures the sum of all payments matches the bill total to the exact paisa.

---

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons & UI**: Lucide React, Sonner (Toasts), React Dropzone, QRCode.react

### Backend
- **Framework**: Python 3.12 + FastAPI
- **Validation**: Pydantic v2
- **AI & OCR Engine**: Google GenAI SDK (Gemini Vision OCR)
- **Image Processing**: Pillow (PIL)
- **ASGI Server**: Uvicorn
- **Utilities**: Python Multipart, Python Dotenv

> **Communication**: The React frontend and FastAPI backend communicate exclusively via structured REST API endpoints.

---

## Project Architecture

```text
SplitBill/
├── backend/                  # FastAPI Python Backend
│   ├── app/
│   │   ├── api/              # API Route Handlers (health, receipt, split)
│   │   ├── models/           # Pydantic Schemas & Data Contracts
│   │   ├── services/         # Gemini OCR & Proportional Split Engine
│   │   ├── utils/            # Image Validation & Helpers
│   │   ├── config.py         # App Configuration & Environment Variables
│   │   └── main.py           # FastAPI App Entrypoint
│   ├── tests/                # Automated Backend QA Test Suite
│   ├── requirements.txt      # Python Dependencies
│   └── README.md
├── docs/                     # Documentation & Specifications
│   ├── DEVELOPMENT_PLAN.md
│   ├── PRD.md
│   └── UI_REFERENCE.md
├── src/                      # Complete React Application
│   ├── components/           # Modular UI Components (upload, review, people, assign, split, layout)
│   ├── hooks/                # Custom React Hooks
│   ├── lib/                  # Utilities & Application Constants
│   ├── pages/                # Application Page Views
│   ├── services/             # Backend API Client (api.ts)
│   ├── store/                # Zustand Global Store (useSplitStore.ts)
│   ├── types/                # TypeScript Interfaces & Models
│   ├── App.tsx               # Root Routing & App Shell
│   ├── index.css             # Tailwind CSS Design System
│   └── main.tsx              # React DOM Entry
├── public/                   # Static Assets
├── .env.example              # Environment Template (Frontend)
├── .env.production.example   # Production Environment Template
├── tsconfig.json             # TypeScript Configuration
├── vite.config.ts            # Vite Configuration
└── package.json              # Node.js Dependencies
```

---

## Application Workflow

```text
Upload Receipt ──> Review Bill ──> Add People ──> Assign Items ──> Split Result
```

1. **Upload Receipt**: Upload a photo of the restaurant bill for automated Gemini Vision OCR parsing.
2. **Review Bill**: Verify extracted line items, prices, GST, service charge, and bill totals in an editable table.
3. **Add People**: Enter dining companion names and pick avatar accent colors.
4. **Assign Items**: Tag everyone who shared each dish, main course, drink, or dessert.
5. **Split Result**: View transparent individual billing cards, scan the organizer's UPI QR, and share settlement receipts.

---

## Backend API

| Endpoint | Method | Purpose | Response |
| :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Health check and uptime status | `{"status": "ok", "service": "SplitBill API", "version": "1.0.0"}` |
| `/api/receipt/extract` | `POST` | Upload receipt image and extract structured items & charges | `{"success": true, "data": { "restaurant": {...}, "charges": {...}, "items": [...] }}` |
| `/api/split/calculate` | `POST` | Calculate exact proportional split and balanced diner ledger | `{"success": true, "participants": [...], "allocation": { "isBalanced": true, ... }}` |

---

## Environment Variables

### Frontend `.env`
```env
# Backend API Base URL
VITE_API_URL=http://127.0.0.1:8000
```
- `VITE_API_URL`: The root URL of the running FastAPI backend server.

### Backend `.env`
```env
# Google Gemini API Key (Required for Receipt OCR)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port & CORS
PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173
```
- `GEMINI_API_KEY`: API key from Google AI Studio used for receipt OCR.
- `PORT`: Port on which Uvicorn runs the FastAPI backend.
- `CORS_ORIGINS`: Comma-separated list of allowed frontend origins for CORS.

---

## Local Development

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create & activate Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend server
uvicorn app.main:app --reload --port 8000
```
- Backend runs at: `http://localhost:8000`
- Interactive Swagger API docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup
```bash
# Install dependencies (from project root)
npm install

# Start Vite development server
npm run dev
```
- Frontend runs at: `http://localhost:3000` (or `http://localhost:3001`)

---

## Project Highlights

- **Gemini Vision OCR**: High-accuracy multi-model extraction with automatic fallback and retry resilience.
- **FastAPI Backend**: Clean modular architecture with Pydantic v2 validation and structured logging.
- **Pydantic Validation**: Strict schemas validate every extracted receipt item and bill calculation payload.
- **Exact Proportional Split Algorithm**: Proportional tax/discount allocation with automatic remainder balancing ensuring 0 discrepancy.
- **Zero Mock Receipt Data**: Strictly processes real uploaded receipt images with zero placeholder dishes.
- **Responsive UI**: Built with Tailwind CSS v4 and Framer Motion for smooth mobile, tablet, and desktop experiences.
- **Type-Safe Full Stack**: TypeScript interfaces on frontend synchronized with Pydantic models on backend.

---

## Future Improvements

- [ ] **Multi-Receipt Support**: Merge multiple food, bar, and dessert receipts into a single settlement session.
- [ ] **Real-Time Collaborative Splitting**: Allow multiple friends to join via room code and tag items from their own phones.
- [ ] **Receipt History**: Export past dining receipts to PDF with tax deduction tags.
- [ ] **Direct Payment Confirmation**: Webhook integration for instant UPI payment verification.

---

## License

Built for placement / hackathon submission.