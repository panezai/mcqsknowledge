# ============================================================
# Stage 1: Python data parsing (one-time script)
# ============================================================
FROM python:3.12-slim AS python-parser

WORKDIR /app

# Copy only what Python needs
COPY scripts/parse_scraped.py scripts/
COPY scraper-data/ scraper-data/

# Run the parser to generate mcqs.json (|| true = don't fail if scraper-data is empty)
RUN python scripts/parse_scraped.py || true

# ============================================================
# Stage 2: Build Next.js with Bun
# ============================================================
FROM oven/bun:1 AS builder

WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Copy all source
COPY . .

# Copy parsed data output from Python stage
COPY --from=python-parser /app/scraper-data/ ./scraper-data/

# Prisma: set DB URL and generate client
ENV DATABASE_URL=file:/app/db/custom.db
RUN bunx prisma generate

# Build Next.js in standalone mode
RUN bun run build

# ============================================================
# Stage 3: Production runtime (slim)
# ============================================================
FROM oven/bun:1-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/db/custom.db

# Copy standalone Next.js output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy the SQLite database
COPY --from=builder /app/db ./db

# Copy generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

EXPOSE 3000

CMD ["bun", "server.js"]
