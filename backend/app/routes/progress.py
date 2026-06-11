from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import datetime
from typing import List
from backend.app.database import get_db
from backend.app import models, schemas, auth
from backend.app.routes.quiz import gain_xp

router = APIRouter(prefix="/progress", tags=["Progress & Leaderboard"])

@router.get("/dashboard", response_model=schemas.DashboardData)
def get_dashboard(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Total and completed lessons
    total_lessons = db.query(models.Lesson).count()
    completed_lessons = db.query(models.Progress).filter(
        models.Progress.user_id == current_user.id,
        models.Progress.completed == True
    ).count()
    
    progress_pct = (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0
    
    # Quiz stats
    attempts = db.query(models.QuizAttempt).filter(models.QuizAttempt.user_id == current_user.id).all()
    attempts_count = len(attempts)
    
    avg_score = 0.0
    if attempts_count > 0:
        total_pct = sum((att.score / att.total_questions * 100) if att.total_questions > 0 else 0 for att in attempts)
        avg_score = total_pct / attempts_count

    # Leaderboard Rank calculation: Count users who have more XP (or higher level, then higher XP) than current user
    # Formula for ranking: 1 + count(users with more level OR (same level and more XP))
    higher_users = db.query(models.User).filter(
        (models.User.level > current_user.level) | 
        ((models.User.level == current_user.level) & (models.User.xp > current_user.xp))
    ).count()
    rank = higher_users + 1

    # Badges/Achievements mapping
    user_badges = []
    for ach in current_user.achievements:
        # Get unlocked date from link table
        link = db.query(models.user_achievements).filter_by(
            user_id=current_user.id,
            achievement_id=ach.id
        ).first()
        unlocked_at = link.unlocked_at if link else datetime.datetime.utcnow()
        
        user_badges.append(schemas.AchievementResponse(
            name=ach.name,
            description=ach.description,
            badge_code=ach.badge_code,
            xp_reward=ach.xp_reward,
            unlocked_at=unlocked_at
        ))

    # Construct the user schema
    user_schema = schemas.User.model_validate(current_user)

    return schemas.DashboardData(
        user=user_schema,
        completed_lessons_count=completed_lessons,
        total_lessons_count=total_lessons,
        progress_percentage=progress_pct,
        streak=current_user.streak,
        xp=current_user.xp,
        level=current_user.level,
        badges=user_badges,
        quiz_attempts_count=attempts_count,
        average_quiz_score=avg_score,
        leaderboard_rank=rank
    )

@router.get("/leaderboard", response_model=List[schemas.LeaderboardEntry])
def get_leaderboard(db: Session = Depends(get_db)):
    users = db.query(models.User).order_by(
        models.User.level.desc(),
        models.User.xp.desc()
    ).limit(10).all()
    
    return [
        schemas.LeaderboardEntry(
            username=u.username,
            level=u.level,
            xp=u.xp,
            streak=u.streak
        ) for u in users
    ]

@router.post("/lessons/{lesson_id}", response_model=schemas.ProgressResponse)
def complete_lesson(
    lesson_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )
        
    # Check if already completed
    progress = db.query(models.Progress).filter(
        models.Progress.user_id == current_user.id,
        models.Progress.lesson_id == lesson_id
    ).first()
    
    if progress:
        return progress

    # Save progress and reward XP
    progress = models.Progress(
        user_id=current_user.id,
        lesson_id=lesson_id,
        completed=True
    )
    db.add(progress)
    
    # 50 XP per lesson
    gain_xp(current_user, 50, db)
    
    db.commit()
    db.refresh(progress)
    return progress
