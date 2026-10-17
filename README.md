# MilkFlow — Dairy Management System

A web-based dairy management application for managing farmers, milk collections, milk quality, payments, and operational reports.

## Features

- Farmer registration and management
- Milk collection recording
- Milk quality management
- Payment management
- Dashboard statistics and analytics charts
- Daily, monthly, and farmer-wise reports
- CSV export for collection reports
- JWT-based authentication
- PostgreSQL database integration

## Technology Stack

### Frontend
- React
- Vite
- Bootstrap
- Axios
- Recharts

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- Alembic database migrations
- JWT authentication

## Project Structure

```text
dairy-monitoring-system/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── models/
│   │   ├── routers/
│   │   └── schemas/
│   ├── alembic/
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── alembic.ini
├── .gitignore
└── README.md
```

## Prerequisites

- Python 3.11 or a compatible Python version
- Node.js and npm
- PostgreSQL
- Git

## Backend Setup

Open PowerShell in the project root and run:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Create `backend/.env` using `backend/.env.example` as a template. Configure your PostgreSQL connection and a strong, private JWT secret.

Start the backend:

```powershell
uvicorn app.main:app --reload
```

Backend URL: `http://127.0.0.1:8000`

Interactive API documentation: `http://127.0.0.1:8000/docs`

## Database Setup

1. Create the PostgreSQL database.
2. Configure `DATABASE_URL` in `backend/.env`.
3. Apply the project's Alembic migrations if migrations have been created and reviewed.

Run migrations from the project root:

```powershell
cd E:\dairy-monitoring-system
.\backend\.venv\Scripts\Activate.ps1
alembic upgrade head
```

## Frontend Setup

Open a second PowerShell terminal:

```powershell
cd E:\dairy-monitoring-system\frontend
npm install
```

Create `frontend/.env` using `frontend/.env.example` as a template. For local development, configure:

```text
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Start the frontend:

```powershell
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## Production Build

From the frontend directory:

```powershell
npm run build
```

Vite generates the production build in `frontend/dist/`.

## Security Notes

- Never commit `.env` files, database passwords, or JWT secrets.
- Use a strong, randomly generated JWT secret.
- Configure appropriate CORS origins for deployment.
- Use HTTPS in production.
- Do not use development servers with `--reload` as production servers.
- Create backups before applying database migrations to a live database.

## Project Status

The frontend production build and backend Python syntax checks have completed successfully in the development environment. Production deployment and live-environment testing remain to be completed.
