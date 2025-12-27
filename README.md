Live Deployment

Base URL:
https://collaborator-9p37.onrender.com

Health Check:
https://collaborator-9p37.onrender.com/health

Swagger API Docs:
https://collaborator-9p37.onrender.com/api/docs

⚠️ Note: The service is deployed on Render free tier and may cold-start after inactivity.

🛠️ Tech Stack

Backend: Node.js, Express, TypeScript

Database: PostgreSQL

Caching / Rate Limiting: Redis

Authentication: JWT (JSON Web Tokens)

Authorization: Role-Based Access Control (RBAC)

Real-time: Socket.IO

API Docs: Swagger (OpenAPI)

Containerization: Docker & Docker Compose

Hosting: Render (Free Tier)

✨ Features
🔐 Authentication & Authorization

User registration & login

Password hashing using bcrypt

JWT-based authentication

Middleware-driven authorization

🏢 Workspaces

Create and list workspaces

Invite members to workspaces

Workspace roles:

OWNER

COLLABORATOR

VIEWER

📁 Projects

Create projects inside workspaces

List projects per workspace

Delete projects

Permission enforcement based on workspace role

👥 Project Members

Add users to projects

Update member roles

Remove members

Ensures at least one OWNER per project

Project roles:

OWNER

CONTRIBUTOR

VIEWER

📝 Activity Logs

Logs key actions such as:

Workspace creation

Project creation/deletion

Member add/remove/update

Stored in PostgreSQL

Fetchable via API

Broadcasted via Socket.IO

🔔 Real-time Updates

Socket.IO integration

Real-time activity notifications per workspace

Supports collaborative environments

📚 API Documentation (Swagger)

Swagger UI is available at:

/api/docs


You can:

Explore all APIs

Test endpoints

Provide JWT token via Authorize button

🔑 Authentication in Swagger

Login using:

POST /api/v1/auth/login


Copy the accessToken

Click Authorize in Swagger

Paste:

Bearer <accessToken>

⚙️ Environment Variables

Example .env:

PORT=8080
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://user:password@host:5432/dbname
NODE_ENV=production

🐳 Run Locally with Docker
Prerequisites

Docker

Docker Compose

Steps
git clone <your-github-repo-url>
cd collab-backend-stub
docker compose up --build


Server will be available at:

http://localhost:8080


Swagger:

http://localhost:8080/api/docs

🗄️ Database Setup

PostgreSQL runs as a Docker container (locally)

Tables are auto-created if missing on app startup

No external database account required for local setup

🌍 Deployment Notes

Deployed on Render using Docker

PostgreSQL is provided by Render

WebSockets (Socket.IO) are supported

Free tier may sleep after inactivity (cold start delay)

Vercel is not used for backend deployment due to its serverless limitations (no persistent servers or WebSockets).

🧪 Testing

APIs tested via Swagger and curl

Role-based access verified

Database integrity validated using PostgreSQL queries

📌 Future Enhancements (Optional)

Background jobs using Redis queues

Automated tests (Jest / Supertest)

Email notifications

Fine-grained audit logs

👨‍💻 Author

Aryan Jaiswal
Backend Developer
