# Manufacturing Trial Documentation

A web application for tracking and documenting manufacturing trials, including parameters, materials, costs, and outcomes.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Icons:** Lucide React

## Features

- Create, view, edit manufacturing trial documentation
- Track materials, process parameters, and costs
- Auto-generated trial numbers (TR-YYYY-###)
- Auto-calculated cost totals
- Search, filter, and sort trials
- Dashboard with summary stats
- Analytics with charts (status distribution, department breakdown, cost trends)
- Print-friendly trial views
- Responsive design (mobile-friendly)

## Environment Variables

Create a `.env.local` file in the project root with the following:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```

You can find these values in your Supabase project's Settings > API page.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from Settings > API
3. Create `.env.local` from the template:
   ```bash
   cp .env.example .env.local
   ```
4. Fill in your Supabase credentials

### 3. Run Database Migration

In your Supabase Dashboard, go to the SQL Editor and run the contents of:

```
supabase/migrations/001_initial_schema.sql
```

Or, if using the Supabase CLI:

```bash
supabase db push
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deployment (Vercel)

### 1. Push to GitHub

```bash
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Deploy to Vercel

1. Import your GitHub repository at [vercel.com/new](https://vercel.com/new)
2. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with header, sidebar, toaster
│   ├── page.tsx                # Dashboard / home page
│   ├── loading.tsx             # Global loading state
│   ├── not-found.tsx           # 404 page
│   ├── globals.css             # Global styles & CSS variables
│   ├── trials/
│   │   ├── page.tsx            # Trials list page
│   │   ├── loading.tsx         # Trials loading state
│   │   ├── new/
│   │   │   └── page.tsx        # Create new trial
│   │   └── [id]/
│   │       ├── page.tsx        # View trial details
│   │       └── edit/
│   │           └── page.tsx    # Edit trial
│   └── analytics/
│       └── page.tsx            # Analytics dashboard
├── components/
│   ├── layout/
│   │   ├── header.tsx          # Top navigation bar
│   │   └── sidebar.tsx         # Side navigation
│   ├── trials/
│   │   ├── trial-form.tsx      # Full trial form with dynamic tables
│   │   ├── trial-list.tsx      # Searchable/sortable trials table
│   │   └── trial-card.tsx      # Trial summary card
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── actions.ts              # Server actions (CRUD)
│   ├── types.ts                # TypeScript interfaces
│   ├── utils.ts                # Helper functions
│   ├── validations.ts          # Zod schemas
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       └── server.ts           # Server Supabase client
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Database schema
```

## Future Roadmap (Phase 2)

- Problem-Solving Tools (5 Whys, Fishbone diagrams)
- User authentication & role-based access
- File attachments (photos, documents)
- PDF export of trial reports
- Email notifications
- Approval workflows
- Audit trail / change history
- Batch operations
- Advanced analytics & reporting
