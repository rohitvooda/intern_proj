from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import engine, Base, SessionLocal
from backend.app import models
from backend.app.routes import auth, quiz, progress, ai

# Initialize FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
# Allow localhost development and deployment hosts
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev, we allow all. In production we would restrict.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(quiz.router, prefix=settings.API_V1_STR)
app.include_router(progress.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "message": f"Welcome to the {settings.PROJECT_NAME} API!",
        "status": "online",
        "documentation": "/docs"
    }

def seed_database():
    """Seeds essential achievements, courses and lessons on application startup."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # 1. Seed Achievements (Gamification Badges)
        achievements_to_seed = [
            ("Science Explorer", "Welcome to ScienceVerse! Begun your learning journey.", "science_explorer", 100),
            ("Physics Master", "Conquered forces, trajectory, and mechanics.", "physics_master", 200),
            ("Biology Genius", "Mastered the microscopic wonders inside a cell.", "biology_genius", 200),
            ("Code Architect", "Decoded recursion and complex data structures.", "code_architect", 200)
        ]
        
        for name, desc, code, xp in achievements_to_seed:
            existing = db.query(models.Achievement).filter(models.Achievement.badge_code == code).first()
            if not existing:
                ach = models.Achievement(name=name, description=desc, badge_code=code, xp_reward=xp)
                db.add(ach)
                
        # 2. Seed Courses
        courses_to_seed = [
            ("Biology Cell Explorer", "Interactive 3D Cell structure study and AI-powered organelle explanations.", "cell-explorer"),
            ("Physics Lab", "Interactive Physics engine simulator with real-time graphs and AI tutoring.", "physics-lab"),
            ("Data Structure Visualizer", "Step-by-step algorithms, visual operations, and structural diagrams.", "ds-visualizer")
        ]
        
        course_db_map = {}
        for title, desc, code in courses_to_seed:
            course = db.query(models.Course).filter(models.Course.code == code).first()
            if not course:
                course = models.Course(title=title, description=desc, code=code)
                db.add(course)
                db.commit()
                db.refresh(course)
            course_db_map[code] = course

        # 3. Seed Lessons for each Course
        lessons_to_seed = {
            "cell-explorer": [
                ("Introduction to Eukaryotic Cells", 1, "Eukaryotic cells are complex units of life containing membrane-bound organelles that coordinate like a busy city."),
                ("The Control Center (Nucleus)", 2, "The nucleus houses DNA, the instruction manual for constructing proteins and organizing cellular activities."),
                ("Energy Production (Mitochondria)", 3, "Mitochondria produce ATP, the cellular currency of energy, through the process of cellular respiration.")
            ],
            "physics-lab": [
                ("The Science of Trajectory", 1, "Projectile motion follows a parabolic path dictated by initial launch velocity, angle of launch, and gravitational acceleration."),
                ("Understanding Pendulum Periods", 2, "A pendulum's swing length governs its frequency; Galileo proved that mass does not dictate the period of a pendulum's swing."),
                ("Free Fall Mechanics", 3, "Free fall occurs when gravity is the sole force acting on an object. In a vacuum, all things drop at 9.8 m/s^2.")
            ],
            "ds-visualizer": [
                ("Linear Structures (Stack & Queue)", 1, "Stacks operate on Last-In-First-Out (LIFO) while Queues operate on First-In-First-Out (FIFO) rules of element ordering."),
                ("Linked Lists", 2, "A linked list is a linear collection of data elements where order is defined by pointers rather than contiguous memory allocation."),
                ("Hierarchical Trees (BST)", 3, "Binary Search Trees speed up search by arranging nodes smaller than parent to the left, and larger nodes to the right.")
            ]
        }
        
        for course_code, lessons in lessons_to_seed.items():
            course = course_db_map.get(course_code)
            if not course:
                continue
            for title, order, content in lessons:
                existing_lesson = db.query(models.Lesson).filter(
                    models.Lesson.course_id == course.id,
                    models.Lesson.title == title
                ).first()
                if not existing_lesson:
                    les = models.Lesson(course_id=course.id, title=title, order=order, content=content)
                    db.add(les)
                    
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

# Run seeding on startup
seed_database()
