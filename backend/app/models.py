import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

# Association table for User-Achievement (many-to-many)
user_achievements = Table(
    "user_achievements",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("achievement_id", Integer, ForeignKey("achievements.id", ondelete="CASCADE"), primary_key=True),
    Column("unlocked_at", DateTime, default=datetime.datetime.utcnow)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Gamification
    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    streak = Column(Integer, default=0)
    last_active = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    progress_records = relationship("Progress", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("Achievement", secondary=user_achievements, back_populates="users")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    code = Column(String, unique=True, index=True, nullable=False) # 'cell-explorer', 'physics-lab', 'ds-visualizer'

    # Relationships
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")
    quiz_questions = relationship("QuizQuestion", back_populates="course", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="course", cascade="all, delete-orphan")

class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    order = Column(Integer, default=0)
    content = Column(Text, nullable=True)

    # Relationships
    course = relationship("Course", back_populates="lessons")
    progress_records = relationship("Progress", back_populates="lesson", cascade="all, delete-orphan")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    question_type = Column(String, nullable=False)  # 'MCQ', 'TF', 'MATCH'
    question_text = Column(Text, nullable=False)
    options_json = Column(Text, nullable=True)  # JSON string of options
    correct_answer = Column(Text, nullable=False)  # For MCQ: option, TF: 'True' or 'False', MATCH: JSON map
    explanation = Column(Text, nullable=True)

    # Relationships
    course = relationship("Course", back_populates="quiz_questions")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    attempted_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="quiz_attempts")
    course = relationship("Course", back_populates="quiz_attempts")

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=False)
    badge_code = Column(String, unique=True, nullable=False)  # 'science_explorer', 'physics_master', etc.
    xp_reward = Column(Integer, default=100)

    # Relationships
    users = relationship("User", secondary=user_achievements, back_populates="achievements")

class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="progress_records")
    lesson = relationship("Lesson", back_populates="progress_records")
