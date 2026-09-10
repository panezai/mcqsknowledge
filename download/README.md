# MCQs Knowledge - Pakistan's Largest MCQs Website

A complete clone of pakmcqs.com built with Next.js 16, Prisma, and SQLite.

## Features

- 37+ Subject Categories
- 3,400+ MCQs (Multiple Choice Questions)
- SEO-friendly URLs (`/english-mcqs`, `/general_knowledge_mcqs`, etc.)
- Online Quiz System with instant scoring
- AI-powered answer generation
- Search functionality
- Mobile responsive design
- Full SEO optimization (meta tags, JSON-LD, sitemap, robots.txt)

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5
- **Database**: Prisma ORM with SQLite
- **Styling**: Tailwind CSS 4 with shadcn/ui
- **State Management**: Zustand
- **Icons**: Lucide React

## Setup Instructions

1. **Install dependencies:**
   ```bash
   bun install
   # or
   npm install
   ```

2. **Set up the database:**
   The SQLite database is included at `db/custom.db` with all MCQs pre-loaded.

   If you need to regenerate the Prisma client:
   ```bash
   bun run db:generate
   ```

3. **Run the development server:**
   ```bash
   bun run dev
   ```
   The app will be available at `http://localhost:3000`

4. **Build for production:**
   ```bash
   bun run build
   bun run start
   ```

## Project Structure

```
.
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage (server component)
│   │   ├── layout.tsx            # Root layout
│   │   ├── [category]/           # Category pages
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx    # MCQ detail pages
│   │   ├── api/                  # API routes
│   │   ├── sitemap.ts            # Dynamic sitemap
│   │   └── robots.ts             # Robots.txt
│   ├── components/               # React components
│   └── store/                    # Zustand store
├── prisma/
│   └── schema.prisma             # Database schema
├── db/
│   └── custom.db                 # SQLite database (pre-loaded)
├── scripts/                      # Scraping scripts
└── scraper-data/                 # Raw scraped data
```

## SEO Features

- Server-side rendering (SSR) for all pages
- Dynamic metadata (title, description, keywords)
- Open Graph and Twitter Card tags
- JSON-LD structured data (WebSite, CollectionPage, Question, BreadcrumbList)
- Canonical URLs
- Dynamic sitemap.xml
- robots.txt
- SEO-friendly URL structure

## Categories Included

General Knowledge, Pakistan Current Affairs, World Current Affairs, Pak Study, Islamic Studies, Everyday Science, English, Mathematics, Computer, Physics, Chemistry, Biology, Pedagogy, Psychology, Economics, Marketing, and more.
