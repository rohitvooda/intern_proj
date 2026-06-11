from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Auth / User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    level: int
    xp: int
    streak: int
    last_active: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    username: Optional[str] = None

# Course / Lesson Schemas
class LessonBase(BaseModel):
    title: str
    order: int
    content: Optional[str] = None

class Lesson(LessonBase):
    id: int
    course_id: int

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    code: str

class Course(CourseBase):
    id: int
    lessons: List[Lesson] = []

    class Config:
        from_attributes = True

# Progress Schemas
class ProgressBase(BaseModel):
    lesson_id: int
    completed: bool = True

class ProgressResponse(BaseModel):
    id: int
    user_id: int
    lesson_id: int
    completed: bool
    completed_at: datetime

    class Config:
        from_attributes = True

# Quiz Schemas
class QuizQuestionBase(BaseModel):
    id: int
    course_id: int
    question_type: str
    question_text: str
    options: List[str]  # Parsed from options_json
    explanation: Optional[str] = None

class QuizSubmitAnswer(BaseModel):
    question_id: int
    answer: str

class QuizSubmitRequest(BaseModel):
    answers: List[QuizSubmitAnswer]

class QuizSubmitResponse(BaseModel):
    score: int
    total: int
    passed: bool
    xp_gained: int
    level_up: bool
    new_level: int
    new_xp: int
    unlocked_badges: List[str] = []
    explanations: Dict[int, Dict[str, Any]]  # question_id -> {correct: bool, correct_answer: str, explanation: str}

# Achievement Schemas
class AchievementResponse(BaseModel):
    name: str
    description: str
    badge_code: str
    xp_reward: int
    unlocked_at: datetime

# Dashboard / Leaderboard Schemas
class LeaderboardEntry(BaseModel):
    username: str
    level: int
    xp: int
    streak: int

class DashboardData(BaseModel):
    user: User
    completed_lessons_count: int
    total_lessons_count: int
    progress_percentage: float
    streak: int
    xp: int
    level: int
    badges: List[AchievementResponse]
    quiz_attempts_count: int
    average_quiz_score: float
    leaderboard_rank: int

# AI Request / Response Schemas
class AIExplainRequest(BaseModel):
    topic: str
    context: Optional[str] = None
    age_group: Optional[str] = "10"  # defaults to 10 for "like I am 10"

class AIExplainResponse(BaseModel):
    explanation: str

class AIChatRequest(BaseModel):
    message: str
    chat_history: Optional[List[Dict[str, str]]] = []
    context_topic: Optional[str] = None

class AIChatResponse(BaseModel):
    reply: str
    suggested_quizzes: Optional[List[str]] = []
    next_topic_suggestion: Optional[str] = None

class AIQuizRequest(BaseModel):
    topic: str
    difficulty: Optional[str] = "medium"

class AIVoiceRequest(BaseModel):
    text: str
    voice_type: Optional[str] = "default"

class AIWeaknessReport(BaseModel):
    weaknesses: List[str]
    revision_notes: str
    suggested_focus: List[str]
