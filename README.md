# SplitBill 🧾✨

> **Split the bill. Not the friendship.**

SplitBill is a high-performance, AI-powered restaurant bill splitting web application designed for group dining. It parses itemized dining receipts, handles proportional GST and service charges down to the exact rupee, and exports deep-links directly to Indian payment apps (UPI, Google Pay, PhonePe, Paytm).

---

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 6](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **File Upload**: [React Dropzone](https://react-dropzone.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

---

## 🎨 Design System

| Token | Value | Description |
| :--- | :--- | :--- |
| **Primary Green** | `#16A34A` | Brand accent & primary CTAs |
| **Dark Green** | `#15803D` | Active states & gradients |
| **Background** | `#F8FAF9` | Off-white sage base with dot-grid pattern |
| **Surface** | `#FFFFFF` | Card & popover surfaces |
| **Border** | `#E5E7EB` | Subtle structural borders |
| **Muted Text** | `#64748B` | Secondary copy and subtitles |
| **Typography** | `Inter` | Clean modern sans-serif |
| **Card Radius** | `24px` | Standard rounded cards |
| **Button Radius** | `14px` | Standard rounded buttons |

---

## 📂 Project Structure

```
d:/Split_the_bill/
├── src/
│   ├── App.tsx                   # Main application layout
│   ├── index.css                 # Tailwind CSS v4 tokens & global styles
│   └── main.tsx                  # React 19 application entry point
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx            # Sticky navigation bar with stepper & profile
│   │   ├── ProgressStepper.tsx   # 5-step interactive workflow stepper
│   │   └── Footer.tsx            # Minimal footer with trust badges & copyright
│   ├── upload/
│   │   ├── UploadHero.tsx        # Hero section with Gemini badge & trust chips
│   │   ├── UploadDropzone.tsx    # Drag-and-drop receipt card with preview
│   │   ├── TrustStats.tsx        # Volume statistics & social proof strip
│   │   ├── FeatureCard.tsx       # AI Instant OCR, Human-in-the-Loop, Proportional GST
│   │   └── PaymentApps.tsx       # Deep-link Indian payment app chips
│   └── shared/
│       ├── Badge.tsx             # Reusable badge component
│       ├── SectionTitle.tsx      # Section heading & subtitle component
│       └── GradientButton.tsx    # Emerald gradient CTA with hover lift & glow
├── lib/
│   ├── mock-data.ts              # Static data, Olive Bistro sample receipt, feature items
│   └── utils.ts                  # Utility functions (cn helper)
├── store/
│   └── useSplitStore.ts          # Zustand store for uploaded files & bill state
├── hooks/
│   └── useMediaQuery.ts          # Responsive screen breakpoint helper
├── types/
│   └── index.ts                  # TypeScript types & interfaces
├── docs/
│   ├── DEVELOPMENT_PLAN.md       # Multi-phase development roadmap
│   ├── PRD.md                    # Product requirements & user flow
│   └── UI_REFERENCE.md           # Screenshot mapping & visual design rules
├── references/                   # UI screenshot designs
├── index.html                    # HTML entry point with Google Fonts
├── vite.config.ts                # Vite configuration with @/* path aliases
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## 🛠️ Getting Started

### Prerequisites

- Node.js `20.x` or higher
- npm `10.x` or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ManasviSepta/SplitBill.git
   cd SplitBill
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000/
   ```

### Production Build

To build the application for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## 📱 Phase 1 Features (Completed)

- [x] **Sticky Navigation**: Floating pill navbar with ₹ logo, `v2.4 AI` badge, currency indicator, green `+` action button, user avatar, and mobile navigation drawer.
- [x] **5-Step Horizontal Stepper**: Progress visualization from `1. Upload Receipt` through `5. Split Result`.
- [x] **Hero Section**: "✨ Powered by Gemini 1.5 Pro Multimodal Vision" badge, dual-tone heading, and trust checkmark chips.
- [x] **Interactive Upload Area**: React Dropzone supporting drag & drop, file browse, image preview with remove option, and one-click sample Olive Bistro bill loader.
- [x] **Trust Statistics**: ₹4.8 Cr+ volume metric, 95k+ meals processed, overlapping community avatars, and 4.9/5 trust rating.
- [x] **Feature Highlights**: AI Instant OCR (99.2% accuracy), Human-in-the-Loop confidence badges, and Proportional GST calculator cards.
- [x] **Payment Ecosystem**: Deep-link badges for UPI Auto-Collect, Google Pay, PhonePe, Paytm, and Cash Ledger.
- [x] **Responsive Layout**: Desktop-first design optimized for tablets and mobile devices.

---

## 🗺️ Roadmap (Upcoming Phases)

- **Phase 2**: Review & Edit Bill screen (`/review`) with editable dish prices, quantities, and GST breakdown.
- **Phase 3**: People & Assignment screen (`/people` & `/assign`) for tagging friends to specific dishes.
- **Phase 4**: Final Settlement & UPI deep-links (`/split`) with WhatsApp export.
- **Phase 5**: Gemini 1.5 Pro multimodal vision OCR integration for live receipt scanning.

---

## 📄 License

MIT License © 2025 SplitBill AI Technologies.