# CardioSport

A cardiac screening management web application for the GAA community, developed as part of CSC3023 Business Information Technology Project at Queen's University Belfast.

## Overview

CardioSport provides GAA players and club administrators with a centralised platform for managing cardiac screening appointments. The application addresses the fragmented and inaccessible nature of current cardiac screening provision for GAA athletes across Ireland.

**Individual players** can:
- Book cardiac screening appointments at clinics across Ireland
- View upcoming and past appointments
- Track cardiac health data
- Manage their account

**Club administrators** can:
- Manage their full player roster
- Monitor squad-wide screening compliance
- Book tests for players
- Generate and export compliance reports

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite 6, Tailwind CSS v4
- **State Management:** Zustand
- **Charts:** Recharts
- **Icons:** Lucide React
- **UI Components:** shadcn/ui + Radix UI
- **Backend:** Supabase (PostgreSQL, Auth, REST API, Row Level Security)
- **Deployment:** Vercel

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
```

## Environment

The application connects to a Supabase backend. The Supabase URL and anon key are configured in `src/lib/supabase.ts`.

## Project Structure

```
src/
├── components/       # All screen components
├── contexts/         # React context providers (ThemeContext)
├── lib/              # Supabase client configuration
├── store/            # Zustand state management
├── styles/           # Global styles
└── App.tsx           # Root component and auth logic
```

## Developer

Tomas McCrink — Queen's University Belfast  
CSC3023 Business Information Technology Project — 2025/26