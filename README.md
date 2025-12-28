# Personal Dashboard

A full-stack business management dashboard built for managing self-employment operations, including client management, invoice generation with PDF export, expense tracking, and Google Drive integration.

## Features

- **Dashboard Overview** - Real-time statistics, revenue charts, and quick access to all modules
- **Client Management** - Full CRUD operations for managing business clients (Kunden)
- **Invoice Generation** - Create professional German invoices with automatic PDF generation
- **PDF Export** - Server-side PDF rendering using React PDF, automatically uploaded to Google Drive
- **Expense Tracking** - Track and categorize business expenses
- **Google Drive Integration** - Browse, upload, and manage files directly from the dashboard
- **Google Sheets Backend** - Uses Google Sheets as a lightweight database for easy data access

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI** | React 19, Tailwind CSS 4 |
| **Authentication** | JWT with jose library |
| **PDF Generation** | @react-pdf/renderer |
| **APIs** | Google Sheets API, Google Drive API |
| **Icons** | Lucide React |

## Architecture

```
app/
├── (dashboard)/           # Protected routes with shared layout
│   ├── page.tsx          # Main dashboard with stats & charts
│   ├── clients/          # Client management
│   ├── invoices/         # Invoice listing & creation
│   ├── drive/            # Google Drive file browser
│   └── gewerbe/          # Business-specific modules
│       ├── clients/      # Gewerbe client management
│       ├── invoices/     # Invoice creation with PDF
│       └── expenses/     # Expense tracking
├── api/
│   ├── auth/             # JWT authentication endpoints
│   ├── clients/          # Client CRUD API
│   ├── invoices/         # Invoice CRUD API
│   ├── drive/            # Google Drive operations
│   └── gewerbe/          # Business-specific APIs
├── login/                # Authentication page
└── layout.tsx            # Root layout

lib/
├── auth.ts               # JWT session management
├── google.ts             # Google Sheets/Drive helpers
├── google-oauth.ts       # OAuth token management
└── gewerbe/
    ├── types.ts          # TypeScript interfaces
    ├── sheets.ts         # Spreadsheet operations
    ├── generate-pdf.ts   # PDF generation
    └── pdf-template.tsx  # Invoice PDF layout

components/
├── dashboard/            # Dashboard-specific components
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── revenue-chart.tsx
└── ui/                   # Reusable UI components
    ├── button.tsx
    ├── card.tsx
    ├── table.tsx
    └── ...
```

## Security

This project follows OWASP security guidelines:

- **Authentication** - JWT-based session management with secure httpOnly cookies
- **Timing-Safe Comparison** - Password verification uses constant-time comparison to prevent timing attacks
- **Input Sanitization** - Query parameters are sanitized to prevent injection attacks
- **Environment Secrets** - All sensitive credentials stored in environment variables
- **Secure Cookies** - Session cookies use `httpOnly`, `secure`, and `sameSite` attributes
- **Route Protection** - Middleware-based authentication for all protected routes

## Design System

Dark theme with geometric styling inspired by HexOS:

- **Background**: `#050505` (page), `#0F0F0F` (sidebar), `#1B2124` (inputs)
- **Accent**: `#E0FF00` (yellow-green)
- **Typography**: Inter font family
- **Components**: Hexagonal clip-path styling on buttons and cards

## Getting Started

### Prerequisites

- Node.js 18+
- Google Cloud Project with Sheets and Drive APIs enabled
- Google Service Account for API access

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/personal-dashboard.git
cd personal-dashboard

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Authentication
DASHBOARD_PASSWORD=your-secure-password
AUTH_SECRET=your-32-character-minimum-secret

# Google Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google OAuth (for Drive uploads)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...

# Google Resources
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_DRIVE_FOLDER_ID=your-folder-id
GOOGLE_DRIVE_INVOICES_FOLDER_ID=your-invoices-folder-id
```

### Invoice Configuration

Configure your business details for invoice PDF generation:

```env
# Invoice Sender Information
INVOICE_SENDER_NAME=Max Mustermann
INVOICE_SENDER_STREET=Musterstr. 1
INVOICE_SENDER_CITY=12345 Berlin
INVOICE_SENDER_UST_ID=DE123456789
INVOICE_SENDER_BANK=Deutsche Bank
INVOICE_SENDER_IBAN=DE89370400440532013000
INVOICE_SENDER_EMAIL=mail@example.com
INVOICE_SENDER_WEBSITE=www.example.com
INVOICE_SENDER_PHONE=+49 123 456789

# Tax Configuration
INVOICE_TAX_RATE=0              # 0 for Kleinunternehmer, 7 or 19 for regular
INVOICE_KLEINUNTERNEHMER=true   # Show §19 UStG notice on invoices
```

| Variable | Description |
|----------|-------------|
| `INVOICE_SENDER_NAME` | Your full name or company name |
| `INVOICE_SENDER_STREET` | Street address |
| `INVOICE_SENDER_CITY` | City with postal code |
| `INVOICE_SENDER_UST_ID` | VAT ID (Umsatzsteuer-Identifikationsnummer) |
| `INVOICE_SENDER_BANK` | Bank name |
| `INVOICE_SENDER_IBAN` | Bank IBAN |
| `INVOICE_SENDER_EMAIL` | Contact email |
| `INVOICE_SENDER_WEBSITE` | Website URL |
| `INVOICE_SENDER_PHONE` | Phone number |
| `INVOICE_TAX_RATE` | Tax rate: `0` (Kleinunternehmer), `7` (reduced), or `19` (standard) |
| `INVOICE_KLEINUNTERNEHMER` | Set to `true` to show Kleinunternehmer notice (§19 UStG) |

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com):

```bash
npm run build
```

Set environment variables in your Vercel project settings.

## Screenshots

*Coming soon*

## License

This project is for personal use. All rights reserved.

---

Built with Next.js and TypeScript
