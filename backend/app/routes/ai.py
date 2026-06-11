from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
from typing import List, Dict, Any
from backend.app.database import get_db
from backend.app import models, schemas, auth
from backend.app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Integration"])

@router.post("/explain", response_model=schemas.AIExplainResponse)
async def explain_topic(
    request: schemas.AIExplainRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    """Explains a topic or organelle, optionally tailored to a younger age group (e.g. 'like I'm 10')"""
    # Create descriptive cache key
    cache_key = f"explain_{request.topic}_{request.age_group}"
    
    # Custom system instructions for educational persona
    system_instruction = (
        "You are a friendly, encouraging AI science teacher in the AI ScienceVerse platform. "
        "Your goal is to explain scientific concepts clearly. "
    )
    
    if request.age_group == "10":
        system_instruction += "Explain the concept using simple analogies, clear words, and engaging storytelling suitable for a 10-year-old child."
        prompt = f"Explain the topic '{request.topic}' in a fun, simple, and detailed way. Context: {request.context or ''}"
    else:
        system_instruction += "Explain the concept comprehensively, providing scientific context and clear structure."
        prompt = f"Explain the topic '{request.topic}' in detail. Context: {request.context or ''}"

    explanation = await AIService.get_ai_completion(prompt, system_instruction, cache_key)
    return schemas.AIExplainResponse(explanation=explanation)

@router.post("/chat", response_model=schemas.AIChatResponse)
async def chat_tutor(
    request: schemas.AIChatRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    """Interactive AI Tutor chat. Supports topic awareness and suggestions."""
    context = request.context_topic or "General Science"
    
    # Build history context
    history_str = ""
    for h in request.chat_history[-5:]: # limit to last 5 messages
        role = "Student" if h.get("role") == "user" else "Tutor"
        history_str += f"{role}: {h.get('content')}\n"

    system_instruction = (
        f"You are the AI Tutor for the course '{context}' in the ScienceVerse application. "
        f"The student's name is {current_user.username}. "
        "Keep your answers friendly, clear, and under 150 words. "
        "If appropriate, end with a tiny 1-question multiple choice test or a follow-up question. "
        "Also suggest what they should learn next. Your response should format cleanly as Markdown."
    )
    
    prompt = f"Previous conversation history:\n{history_str}\n\nStudent asks: {request.message}"
    
    reply = await AIService.get_ai_completion(prompt, system_instruction)
    
    # Parse suggestions from response if possible, or build fallback suggestions
    next_topic = "Projectile motion angles"
    if "cell" in context.lower() or "biology" in context.lower():
        next_topic = "How Mitochondria create ATP energy"
    elif "structure" in context.lower() or "computer" in context.lower():
        next_topic = "Recursive Call Stacks"

    suggested_quizzes = [f"Take the {context} Quiz"]

    return schemas.AIChatResponse(
        reply=reply,
        suggested_quizzes=suggested_quizzes,
        next_topic_suggestion=next_topic
    )

@router.post("/voice", response_model=schemas.AIExplainResponse)
async def voice_synthesis(
    request: schemas.AIVoiceRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    """Processes text to prepare for speech, and runs TTS text normalization."""
    # To keep response light and speed high, this endpoint returns the clean read-aloud text.
    # The frontend will use browser SpeechSynthesis (TTS) which is high performance and instant.
    # This endpoint can act as a speech preprocessor or prompt filter.
    clean_text = request.text.replace("*", "").replace("#", "").replace("$", "")
    return schemas.AIExplainResponse(explanation=clean_text)

@router.post("/weaknesses", response_model=schemas.AIWeaknessReport)
async def analyze_weaknesses(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Analyzes recent quiz attempts to generate personalized weakness reports, flashcards and revision notes."""
    attempts = db.query(models.QuizAttempt).filter(models.QuizAttempt.user_id == current_user.id).all()
    
    if not attempts:
        return schemas.AIWeaknessReport(
            weaknesses=["No quiz attempts recorded yet. Complete a quiz to analyze weaknesses!"],
            revision_notes="Please take a quiz in Cell Explorer, Physics Lab, or Data Structure Visualizer to generate your revision plan.",
            suggested_focus=["Cell Explorer Quiz", "Physics Lab Quiz", "Data Structure Visualizer Quiz"]
        )

    # Compile user results
    results_summary = []
    for att in attempts:
        course = db.query(models.Course).filter(models.Course.id == att.course_id).first()
        course_name = course.title if course else "Unknown Course"
        results_summary.append(f"Quiz: {course_name}, Score: {att.score}/{att.total_questions}")

    summary_str = "\n".join(results_summary)
    
    system_instruction = (
        "You are an AI learning analyst. Analyze the student's quiz scores and identify areas of improvement. "
        "Provide clear, structured weakness analysis, a set of revision flashcards/notes, and 2-3 specific focus points. "
        "Respond with a JSON structure or cleanly formatted text."
    )
    
    prompt = f"The student {current_user.username} has the following quiz history:\n{summary_str}\n\nAnalyze and generate revision notes."
    
    report_text = await AIService.get_ai_completion(prompt, system_instruction)
    
    # Set default values if prompt returned raw text
    weaknesses = ["Focus on weak subject areas"]
    suggested_focus = ["Practice tests"]
    
    if "physics" in summary_str.lower() and any(a.score < a.total_questions * 0.8 for a in attempts if "physics" in str(a.course_id)):
        weaknesses.append("Angle optimization and trajectory calculations in projectile motion")
        suggested_focus.append("Experiment with different launch angles in the Physics Lab")
        
    if "cell" in summary_str.lower() and any(a.score < a.total_questions * 0.8 for a in attempts if "cell" in str(a.course_id)):
        weaknesses.append("Organelle specific roles like Ribosomes and Endoplasmic Reticulum")
        suggested_focus.append("Click and study organelles in Biology Cell Explorer")

    return schemas.AIWeaknessReport(
        weaknesses=weaknesses,
        revision_notes=report_text,
        suggested_focus=suggested_focus
    )

@router.post("/path", response_model=Dict[str, Any])
async def learning_path(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Generates an AI personalized learning path based on user level and badges."""
    badges_unlocked = [ach.name for ach in current_user.achievements]
    badge_str = ", ".join(badges_unlocked) if badges_unlocked else "None"
    
    system_instruction = (
        "You are an AI academic advisor. Create a step-by-step personalized learning path "
        "tailored to the student's current level and badges. "
        "Keep it highly motivational and formatted with markdown bullet points."
    )
    
    prompt = f"Student: {current_user.username}, Level: {current_user.level}, XP: {current_user.xp}, Badges Unlocked: {badge_str}."
    
    path_details = await AIService.get_ai_completion(prompt, system_instruction)
    
    return {
        "user_level": current_user.level,
        "badges": badges_unlocked,
        "personalized_path": path_details
    }
