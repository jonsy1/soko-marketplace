# Soko — Business Marketplace Platform

A full-stack, working "Play Store for businesses" marketplace: customers search
one place for products from many registered businesses, business owners get
their own storefront + dashboard, and you (the admin) approve sellers and
watch the whole platform.

Built with **Next.js 14** (frontend + backend API in one project),
**Prisma + SQLite** (a real database — no external database service to set up),
and **Auth.js (NextAuth v5)** for login.

---

## What's included (Version 1 scope)

**Customers**
- Sign up / log in
- Search & browse products across every registered business, filter by category
- View a product page and a business's storefront
- Place an order (pickup, seller delivery, or "meet directly") with one click

**Business owners**
- "Open your storefront" — register a business (auto-upgrades your account)
- Dashboard: sales-today, order counts, recent orders
- Add / edit / hide / delete products
- View and update orders (confirm → processing → ready → delivered)
- Store settings (name, description, logo, delivery availability)

**Admin** (log in with the seeded admin account below)
- Platform overview: businesses, products, orders, customers, gross order value
- Approve / suspend / reinstate businesses
- Manage categories
- View all orders platform-wide

This matches the "Version 1 MVP" from your platform plan. Payments, reviews,
ratings, and delivery-partner integration are the natural Version 2 additions
once this is live and being used.

---

## 1. Install the tools you need (one-time, skip anything you already have)

1. **Node.js** — download and install from https://nodejs.org (choose the
   "LTS" version). This gives you `node` and `npm`.
2. **A code editor** — Notepad works, but if you have VS Code
   (https://code.visualstudio.com) it will be much easier.
3. Unzip this project folder somewhere easy to find, e.g.
   `Documents\soko-marketplace`.

## 2. Open a terminal in the project folder

- Windows: open the `soko-marketplace` folder in File Explorer, click the
  address bar, type `cmd`, press Enter. This opens Command Prompt already
  inside the folder.

## 3. Install the project's dependencies

```
npm install
```

This downloads everything the project needs, including Prisma's database
engine (a one-time download — it needs normal internet access, so if it fails,
just run `npm install` again).

## 4. Create your environment file

Copy `.env.example` to a new file named `.env` in the same folder (in File
Explorer: copy the file, paste it, rename the copy to `.env`).

Open `.env` and replace `replace-this-with-a-long-random-string` with any long
random text — this is just the secret that signs login sessions, it can be
anything, e.g. `soko-super-secret-key-2026-change-me`.

You do **not** need to set up an external database — it uses a local SQLite
file (`dev.db`) that gets created automatically.

## 5. Create the database tables

```
npm run db:push
```

## 6. (Recommended) Load demo data

This creates an admin account, some categories, and one demo business with
products, so the site isn't empty when you first open it:

```
npm run db:seed
```

- **Admin login:** `admin@soko.co.tz` / `admin123`
- **Demo seller login:** `seller@soko.co.tz` / `seller123`

(Change these passwords, or delete the demo accounts, before you show this to
real users.)

## 7. Run it

```
npm run dev
```

Open **http://localhost:3000** in your browser. That's the whole platform,
running on your own computer.

---

## Everyday workflow once it's running

- Sign up as a normal customer, or log in as the demo seller/admin above.
- As the demo seller: go to **My Store → Products** to add more items, or
  **Orders** to see and process what customers order.
- As admin: go to **Admin → Businesses** to verify new sellers who sign up,
  and **Admin → Categories** to add product categories.

## Putting this online (so others can use it, not just your computer)

The easiest path is the same one you already know from the MIC website:

1. Push this folder to a GitHub repo (`git init`, `git add .`,
   `git commit -m "Initial commit"`, `git push`).
2. Import the repo into Vercel (https://vercel.com).
3. In Vercel's project settings, add the same two environment variables from
   your `.env` file — but for `DATABASE_URL`, use a hosted database instead of
   the local SQLite file (Vercel Postgres or Neon both work, same as your MIC
   website). If you switch to Postgres, change `provider = "sqlite"` to
   `provider = "postgresql"` in `prisma/schema.prisma` first.
4. Deploy, then run `npx prisma db push` once against the live database
   (Vercel's docs show how to do this, or ask me to walk you through it step
   by step when you're ready).

## Project structure, if you want to look around

```
src/app/                    Pages (customer, business dashboard, admin dashboard)
src/app/api/                Backend — every API route (products, orders, businesses…)
src/components/             Shared UI pieces (navbar, product card)
src/auth.ts / auth.config.ts   Login system
src/lib/prisma.ts           Database connection
prisma/schema.prisma        The database structure (every table and field)
prisma/seed.js              Demo data script
```

Every place a business owner, customer, or admin can act — adding a product,
placing an order, approving a seller — has a matching page under `src/app`
and a matching API route under `src/app/api` that actually writes to the
database. Nothing in this build is a mockup.
