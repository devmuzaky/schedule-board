# Fly.io Deployment Guide

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
