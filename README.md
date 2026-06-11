# AI ScienceVerse - Immersive STEM Learning Platform

**AI ScienceVerse** is a production-ready, interactive learning platform that makes STEM subjects visual, practical, and highly engaging. This application satisfies all technical and functional requirements for the **AI Model Development Contest 2026**.

---

## Key Features

1. **Biology Cell Explorer (Module 1)**:
   - Interactive 3D Eukaryotic Cell (Nucleus, Mitochondria, Ribosomes, Cell Membrane, Golgi, ER) using React Three Fiber.
   - Mouse Orbit controls (rotate, zoom, pan) and click interaction.
   - "Explain like I'm 10" AI simplification.
   - Browser Text-to-Speech (TTS) reading out loud.
   - WebGL detection with an interactive 2D SVG vector fallback.
   - 5-question MCQ quiz with XP/Level upgrades.

2. **Physics Lab (Module 2)**:
   - Simulators for Projectile Motion, Pendulum Oscillation, and Free Fall.
   - Real-time parameter sliders (Initial Velocity, Mass, Launch Angle, Gravity).
   - Real-time Recharts line graph tracking Altitude, Distance, and speed.
   - Integrated AI tutor explaining results based on variable shifts.
   - Dedicated quiz testing mechanics concepts.

3. **CS Algorithms Visualizer (Module 3)**:
   - Live animations for Arrays, Stacks, Queues, Linked Lists, and Binary Search Trees.
   - Interactive operations: Insert, Delete, Search.
   - Binary Search Tree step-by-step path highlighting and traversal comparisons.
   - Operations log and AI analysis.
   - Module quiz on data structures.

4. **Personalized AI Engine**:
   - Generative study schedules based on student levels and strengths.
   - Weakness detection reports scanning failed quiz attempts to build custom study flashcards.
   - Speech-To-Text voice capture for asking the AI Tutor questions.

5. **Gamification & Telemetry**:
   - XP system, Level thresholds, streak counters, and automatic database seeders.
   - Collectible badges: *Biology Genius*, *Physics Master*, *Code Architect*, *Science Explorer*.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Zustand, Recharts, Three.js (React Three Fiber & Drei), Lucide icons.
- **Backend**: FastAPI (Python), SQLAlchemy ORM, SQLite (Dev) / Supabase PostgreSQL (Prod), JWT Auth, Bcrypt.
- **AI Integration**: OpenAI GPT / Gemini API HTTP client wrappers with offline tokenization educational response fallbacks.

---

## Project Structure

```
internship project/
├── backend/
│   ├── app/
│   │   ├── routes/          # Auth, progress, AI, quiz endpoints
│   │   ├── services/        # Gemini/OpenAI API wrappers
│   │   ├── models.py        # Database models
│   │   ├── database.py      # SQLAlchemy connection
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── main.py          # FastAPI server entrance
│   ├── requirements.txt     # Python packages
│   └── scienceverse.db      # Development SQLite Database
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages (cell-explorer, physics-lab, etc.)
│   │   ├── components/      # Header, AITutorPanel, Cell3DCanvas
│   │   └── store/           # Zustand state store
│   ├── package.json         # Node.js configurations
│   └── tsconfig.json        # TypeScript settings
└── deliverables/            # Contest files (schemas, API, demo, guides)
```

---

## Quick Start (Local Development)

### 1. Run Backend Server
Ensure Python is installed, navigate to the `backend` folder, and execute:
```bash
# Create virtual environment
python -m venv venv
# Activate virtual environment (Windows)
.\venv\Scripts\activate
# Install requirements
pip install -r requirements.txt
# Run server
uvicorn app.main:app --reload
```
The server will run on `http://127.0.0.1:8000`. API docs can be viewed at `http://127.0.0.1:8000/docs`.

### 2. Run Frontend Client
Navigate to the `frontend` directory, install dependencies, and run development mode:
```bash
# Install packages
npm install
# Run Next.js dev server
npm run dev
```
Open `http://localhost:3000` to interact with the platform.

---

## Contest Deliverables (Deliverables Folder)

All contest requirements have been compiled into detailed guides inside the `deliverables` directory:
- [Database Schema](file:///c:/Users/vooda/Desktop/internship%20project/deliverables/database_schema.md): Table formats, relations, and ER diagram.
- [API Documentation](file:///c:/Users/vooda/Desktop/internship%20project/deliverables/api_documentation.md): REST endpoint structures and JSON templates.
- [Architecture Diagram](file:///c:/Users/vooda/Desktop/internship%20project/deliverables/architecture_diagram.md): Pipeline workflow and components map.
- [Deployment Guide](file:///c:/Users/vooda/Desktop/internship%20project/deliverables/deployment_guide.md): Steps for Vercel, Render, and Supabase.
- [Demo Showcase Script](file:///c:/Users/vooda/Desktop/internship%20project/deliverables/demo_script.md): Narrative template for showcasing to judges.
- [Pitch Deck Slide Outline](file:///c:/Users/vooda/Desktop/internship%20project/deliverables/ppt_outline.md): PowerPoint presentation outline.
- [Judges Guide](file:///c:/Users/vooda/Desktop/internship%20project/deliverables/judges_guide.md): Highlights of technical strengths.
