# Collaborative Workspace Backend - Scaffold

This is a starter scaffold for the **Real-Time Collaborative Workspace** backend assessment.
Technology stack: **Node.js + TypeScript + Express**, with **Postgres** and **Redis** in Docker Compose.

## What’s included
- Basic Express + TypeScript app with sensible folder structure
- Dockerfile and docker-compose.yml (api + postgres + redis)
- ESLint + Prettier config
- Sample env file
- Healthcheck endpoint

## Quick start (Docker Compose)
1. Copy `.env.example` to `.env` and adjust values.
2. Build and run:
```bash
docker-compose up --build
```
3. API will be available at `http://localhost:8080`. Healthcheck: `GET /health`.

## Development (local)
Install dependencies:
```bash
npm install
npm run dev
```

## Next steps I can implement for you
- Authentication (JWT + refresh tokens)
- Database schema + migrations
- Project & workspace CRUD APIs
- WebSocket server + Redis Pub/Sub
- Job queue + worker
- Tests + CI/CD pipeline

Tell me which of those to work on next (I recommend: Authentication).
