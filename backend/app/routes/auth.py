from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.Token)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if username exists
    existing_username = db.query(models.User).filter(models.User.username == user_in.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email exists
    existing_email = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and save user
    hashed_pwd = auth.get_password_hash(user_in.password)
    db_user = models.User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_pwd,
        xp=0,
        level=1,
        streak=1
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Automatically unlock "Science Explorer" badge on register
    science_badge = db.query(models.Achievement).filter(models.Achievement.badge_code == "science_explorer").first()
    if not science_badge:
        science_badge = models.Achievement(
            name="Science Explorer",
            description="Welcome to ScienceVerse! Begun your learning journey.",
            badge_code="science_explorer",
            xp_reward=100
        )
        db.add(science_badge)
        db.commit()
        db.refresh(science_badge)
        
    db_user.achievements.append(science_badge)
    db_user.xp += science_badge.xp_reward
    db.commit()
    db.refresh(db_user)

    # Issue JWT token
    access_token_expires = timedelta(minutes=auth.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": db_user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": db_user}

@router.post("/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == user_in.username).first()
    if not user or not auth.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password"
        )
    
    # Update streak/last active
    import datetime
    today = datetime.datetime.utcnow().date()
    last_active_date = user.last_active.date() if user.last_active else None
    
    if last_active_date:
        delta = (today - last_active_date).days
        if delta == 1:
            user.streak += 1
        elif delta > 1:
            user.streak = 1
    else:
        user.streak = 1
        
    user.last_active = datetime.datetime.utcnow()
    db.commit()
    db.refresh(user)

    access_token_expires = timedelta(minutes=auth.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user
