# Deployment Guide - AI ScienceVerse

This document explains step-by-step how to deploy **AI ScienceVerse** for production launch, satisfying the deployment requirements of the AI Model Development Contest 2026.

---

## 1. Database Setup: Supabase (PostgreSQL)

1. Sign up/log in to [Supabase](https://supabase.com/).
2. Click **New Project** and name it `AI ScienceVerse`. Set a secure database password.
3. Once the project is provisioned, go to **Project Settings** -> **Database**.
4. Find the **Connection string** (URI mode) and copy the URI. It should look like:
   `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres`
5. Keep this URI handy for configuring the backend environment.

---

## 2. Backend Deployment: Render (FastAPI)

1. Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository containing the application.
4. Set the following details in the deployment configuration:
   - **Name**: `scienceverse-backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt` (inside the `backend` folder)
   - **Start Command**: `uvicorn app.main:app --host 0.5.0.0 --port 10000`
5. Click **Advanced** and add these Environment Variables:
   - `DATABASE_URL`: paste your Supabase Connection String.
   - `JWT_SECRET`: generate a random long string (e.g. `openssl rand -hex 32`).
   - `GEMINI_API_KEY`: (Optional) Your Google Gemini API Key.
   - `OPENAI_API_KEY`: (Optional) Your OpenAI API Key.
   - `ACCESS_TOKEN_EXPIRE_MINUTES`: `1440` (1 day).
6. Click **Create Web Service**. Render will build and deploy the FastAPI container. Copy the public service URL (e.g., `https://scienceverse-backend.onrender.com`).

---

## 3. Frontend Deployment: Vercel (Next.js)

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Set the following build settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `frontend`
   - **Build Command**: `next build`
   - **Install Command**: `npm install`
5. In the **Environment Variables** section, add:
   - `NEXT_PUBLIC_API_URL`: Paste the public URL of your Render backend. Make sure it points to `https://scienceverse-backend.onrender.com/api/v1` (without a trailing slash).
6. Click **Deploy**. Vercel will optimize and build the client application.

---

## 4. Post-Deployment Verification

1. Once both deployments succeed, open the Vercel app URL in your browser.
2. Sign up with a new test account. Check that:
   - User database tables are automatically seeded inside Supabase.
   - Initial badges are visible.
3. Open a module page (e.g. Biology Cell) and complete the quiz. Ensure the score submits, XP increments, and achievements update on the dashboard.
