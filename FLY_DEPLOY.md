# Fly.io Deployment Guide

## ⚠️ REQUIRED: Set secrets before deploy

The app **crashes without these**. Run:

```bash
# 1. Get a DB URL from https://neon.tech (free, no card)
# 2. Set secrets:
fly secrets set DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" -a schedule-board
fly secrets set JWT_SECRET="$(openssl rand -base64 32)" -a schedule-board
```

Then deploy: `fly deploy -a schedule-board --depot=false`

---

## Fix "We require your billing information"

Fly.io requires a payment method even for free-tier usage. Complete billing first:

1. **Go to billing**: https://fly.io/dashboard/mohamed-zaky/billing  
   (Replace `mohamed-zaky` with your org name if different)

2. **Add payment method** – Fly waives invoices under ~$5/month for light usage

3. **If the link doesn't work**, try:
   - https://fly.io/apps → select your org → Billing
   - https://fly.io/organizations/personal → Billing (for personal org)

## Deploy (after billing is set up)

### Option A: Fly Postgres (2 machines – API + DB)

```bash
# 1. Create Postgres
fly postgres create --name schedule-board-db

# 2. Attach to your app (get connection string from Fly dashboard)
fly secrets set DATABASE_URL="postgres://user:pass@hostname:5432/dbname"
fly secrets set JWT_SECRET="$(openssl rand -base64 32)"

# 3. Deploy
fly deploy
```

### Option B: Neon.tech (1 machine – API only, free DB)

1. Create free DB at [neon.tech](https://neon.tech) (no card)
2. Copy the connection string
3. Run:

```bash
fly secrets set DATABASE_URL="postgres://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
fly secrets set JWT_SECRET="$(openssl rand -base64 32)"
fly deploy
```

### Verify

- API: https://schedule-board.fly.dev/api/health
- Login: moezaky / password123

---

## Migrate local tasks to deployed (Neon)

To copy your local tasks into the deployed database:

### 1. Get your Neon connection string

- Go to [console.neon.tech](https://console.neon.tech)
- Open your project (the one used by schedule-board)
- Click **Connection string** → choose **Pooled connection**
- Copy the full URL (looks like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`)

### 2. Run the migration

With local Postgres running (e.g. `docker compose up -d postgres`):

```bash
cd node-server

TARGET_DATABASE_URL="postgresql://YOUR_COPIED_URL_HERE" ./migrate-to-neon.sh
```

Or with npm directly:

```bash
cd node-server

SOURCE_DATABASE_URL="postgresql://schedule:schedule@localhost:5432/schedule_db" \
TARGET_DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" \
npm run migrate-to-neon
```

### Behavior

- If user `moezaky` already exists on Neon, tasks are added to that account (existing tasks replaced).
- If not, the user is created with the same password hash from local.
