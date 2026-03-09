# Personal Schedule Board

A full-stack web application for managing your weekly schedule across 6 aspects: English, Frontend, Backend, AI, Soft-skills, and Reading. Features a Kanban-style board with drag-and-drop, progress tracking, and weekly summaries.

## Tech Stack

- **Frontend**: Angular 17+ with Angular Material, CDK Drag-Drop, Chart.js
- **Backend**: Node.js, Express, Prisma ORM
- **Database**: PostgreSQL
- **Deployment**: Docker, Vercel (frontend), Render (backend)

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Angular CLI 17+ (`npm install -g @angular/cli@17`)

## Quick Start (Local Development)

### 1. Start Backend and Database

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Backend API on port 3000 (runs migrations and seeds automatically)

### 2. Start Frontend

```bash
cd angular-app
npm install
npm start
```

The Angular app runs at http://localhost:4200

### 3. Default Login

- **Username**: moezaky
- **Password**: password123

## Project Structure

```
/
├── angular-app/       # Angular 17+ SPA
├── node-server/       # Express API + Prisma
├── docker-compose.yml
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Login (returns JWT) |
| POST | /api/auth/register | Register new user |
| GET | /api/tasks | Get all tasks (auth required) |
| POST | /api/tasks | Create task |
| PATCH | /api/tasks/:id | Update task (day, studiedHours) |
| DELETE | /api/tasks/:id | Delete task |
| POST | /api/progress/:taskId | Log hours for a task |
| GET | /api/progress/export?format=csv | Export progress as CSV |
| POST | /api/weekly-reset | Reset week (archive + reseed) |

## Deployment

### Deploy Backend to Fly.io (no credit card)

1. Install [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) and run `fly auth login`
2. Create Postgres: `fly postgres create` (or use [Neon](https://neon.tech) for free DB)
3. From repo root: `fly deploy`
4. Set secrets: `fly secrets set DATABASE_URL="postgres://..." JWT_SECRET="your-secret"`
5. API will be at `https://schedule-board.fly.dev/api`

### Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/schedule-board.git
git push -u origin main
```

### Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Set **Root Directory** to `angular-app`
3. Add environment variable: `API_URL` = your backend URL (e.g. `https://your-app.onrender.com/api`)
4. Update `angular-app/src/environments/environment.prod.ts` with your API URL, or use Vercel env vars with a build script
5. Deploy

### Deploy Backend (Render)

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `node-server`
4. Add **PostgreSQL** database (Render Dashboard → New → PostgreSQL)
5. Environment variables:
   - `DATABASE_URL`: Internal PostgreSQL URL from Render
   - `JWT_SECRET`: A strong random secret
   - `PORT`: 3000 (or leave default)
6. Build command: `npm install && npx prisma generate && npm run build`
7. Start command: `npx prisma migrate deploy && npx prisma db seed && node dist/index.js`

### Connect Frontend to Backend

Set `apiUrl` in `angular-app/src/environments/environment.prod.ts` to your deployed backend URL (e.g. `https://schedule-board-api.onrender.com/api`). For Vercel, you can use the `API_URL` environment variable and configure the build to inject it.

## Features

- **Kanban Board**: 7 columns (Mon–Sun), drag tasks between days
- **Progress Tracking**: Log studied hours per task, view progress bars
- **Weekly Summary**: Dashboard with aspect-wise progress (e.g. English: 4/6h)
- **Fixed Items**: Gym (Tue/Thu/Sat/Sun) and Weekly review (Sun) shown as non-draggable
- **Weekly Reset**: Button to reset and reseed the schedule
- **CSV Export**: Export progress history from Profile

## License

MIT
