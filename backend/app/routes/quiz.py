from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json
from typing import List, Dict
from backend.app.database import get_db
from backend.app import models, schemas, auth

router = APIRouter(prefix="/quiz", tags=["Quizzes"])

def gain_xp(user: models.User, xp_amount: int, db: Session) -> bool:
    """Updates user XP and handles levels. Returns True if leveled up."""
    user.xp += xp_amount
    leveled_up = False
    
    # Simple level curve: Level N requires N * 500 XP to advance
    while True:
        xp_needed = user.level * 500
        if user.xp >= xp_needed:
            user.xp -= xp_needed
            user.level += 1
            leveled_up = True
        else:
            break
            
    db.commit()
    return leveled_up

@router.get("/questions/{course_code}", response_model=List[schemas.QuizQuestionBase])
def get_quiz_questions(course_code: str, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.code == course_code).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    questions = db.query(models.QuizQuestion).filter(models.QuizQuestion.course_id == course.id).all()
    
    # If no questions in DB, auto-populate default questions
    if not questions:
        seed_quiz_questions(course.id, course_code, db)
        questions = db.query(models.QuizQuestion).filter(models.QuizQuestion.course_id == course.id).all()
        
    result = []
    for q in questions:
        try:
            options = json.loads(q.options_json)
        except Exception:
            options = []
        result.append(schemas.QuizQuestionBase(
            id=q.id,
            course_id=q.course_id,
            question_type=q.question_type,
            question_text=q.question_text,
            options=options,
            explanation=q.explanation
        ))
    return result

@router.post("/submit/{course_code}", response_model=schemas.QuizSubmitResponse)
def submit_quiz(
    course_code: str,
    submission: schemas.QuizSubmitRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(models.Course).filter(models.Course.code == course_code).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Get questions
    questions = db.query(models.QuizQuestion).filter(models.QuizQuestion.course_id == course.id).all()
    q_map = {q.id: q for q in questions}

    correct_count = 0
    explanations = {}
    
    for ans in submission.answers:
        q = q_map.get(ans.question_id)
        if not q:
            continue
        
        is_correct = (ans.answer.strip().lower() == q.correct_answer.strip().lower())
        if is_correct:
            correct_count += 1
            
        explanations[q.id] = {
            "correct": is_correct,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation or "No details available."
        }

    total = len(questions) if questions else 5
    score_pct = (correct_count / total) * 100 if total > 0 else 0
    passed = score_pct >= 60.0

    # Calculate XP reward
    xp_gained = 50 + (correct_count * 30)  # Base 50 + 30 per correct answer
    if passed:
        xp_gained += 100 # Passing bonus
    
    # Update progress and user state
    leveled_up = gain_xp(current_user, xp_gained, db)

    # Save attempt
    attempt = models.QuizAttempt(
        user_id=current_user.id,
        course_id=course.id,
        score=correct_count,
        total_questions=total
    )
    db.add(attempt)
    db.commit()

    # Check for unlocked badges
    unlocked_badges = []
    badge_to_unlock = None
    
    if course_code == "cell-explorer" and passed:
        badge_to_unlock = "biology_genius"
    elif course_code == "physics-lab" and passed:
        badge_to_unlock = "physics_master"
    elif course_code == "ds-visualizer" and passed:
        badge_to_unlock = "code_architect"

    if badge_to_unlock:
        # Check if they already have it
        already_has = db.query(models.User).filter(
            models.User.id == current_user.id
        ).filter(models.User.achievements.any(badge_code=badge_to_unlock)).first()
        
        if not already_has:
            badge = db.query(models.Achievement).filter(models.Achievement.badge_code == badge_to_unlock).first()
            if not badge:
                # Seed it
                name_map = {
                    "biology_genius": "Biology Genius",
                    "physics_master": "Physics Master",
                    "code_architect": "Code Architect"
                }
                desc_map = {
                    "biology_genius": "Mastered the microscopic wonders inside a cell.",
                    "physics_master": "Conquered forces, trajectory, and mechanics.",
                    "code_architect": "Decoded recursion and complex data structures."
                }
                badge = models.Achievement(
                    name=name_map[badge_to_unlock],
                    description=desc_map[badge_to_unlock],
                    badge_code=badge_to_unlock,
                    xp_reward=200
                )
                db.add(badge)
                db.commit()
                db.refresh(badge)
            
            current_user.achievements.append(badge)
            leveled_up = gain_xp(current_user, badge.xp_reward, db) or leveled_up
            unlocked_badges.append(badge.name)

    return schemas.QuizSubmitResponse(
        score=correct_count,
        total=total,
        passed=passed,
        xp_gained=xp_gained,
        level_up=leveled_up,
        new_level=current_user.level,
        new_xp=current_user.xp,
        unlocked_badges=unlocked_badges,
        explanations=explanations
    )

def seed_quiz_questions(course_id: int, course_code: str, db: Session):
    """Pre-populates sample questions for quizzes if not found in database"""
    if course_code == "cell-explorer":
        questions = [
            {
                "question_type": "MCQ",
                "question_text": "Which organelle is widely known as the 'powerhouse of the cell'?",
                "options_json": json.dumps(["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"]),
                "correct_answer": "Mitochondria",
                "explanation": "Mitochondria convert glucose into ATP, which acts as the chemical energy currency of the cell."
            },
            {
                "question_type": "MCQ",
                "question_text": "Where is DNA primarily stored in a eukaryotic cell?",
                "options_json": json.dumps(["Endoplasmic Reticulum", "Cytoplasm", "Nucleus", "Ribosomes"]),
                "correct_answer": "Nucleus",
                "explanation": "The nucleus acts as the control center of the cell and houses the genetic code (DNA)."
            },
            {
                "question_type": "MCQ",
                "question_text": "Which organelle is responsible for synthesizing proteins?",
                "options_json": json.dumps(["Ribosomes", "Cell Membrane", "Lysosomes", "Golgi Apparatus"]),
                "correct_answer": "Ribosomes",
                "explanation": "Ribosomes read mRNA instructions to assemble amino acids into proteins."
            },
            {
                "question_type": "MCQ",
                "question_text": "What is the function of the Golgi Apparatus?",
                "options_json": json.dumps(["Produce sugar", "Destroy waste", "Package and route proteins", "Replicate DNA"]),
                "correct_answer": "Package and route proteins",
                "explanation": "The Golgi apparatus modifies, packages, and ships proteins and lipids like a cell post office."
            },
            {
                "question_type": "MCQ",
                "question_text": "Which organelle forms the selective boundary of the cell, filtering materials entering/exiting?",
                "options_json": json.dumps(["Endoplasmic Reticulum", "Cell Membrane", "Ribosome", "Nucleus"]),
                "correct_answer": "Cell Membrane",
                "explanation": "The lipid bilayer of the cell membrane regulates import and export of materials, acting as a gatekeeper."
            }
        ]
    elif course_code == "physics-lab":
        questions = [
            {
                "question_type": "MCQ",
                "question_text": "At what launch angle does a projectile achieve maximum horizontal range in a vacuum?",
                "options_json": json.dumps(["30 degrees", "45 degrees", "60 degrees", "90 degrees"]),
                "correct_answer": "45 degrees",
                "explanation": "45 degrees offers the optimal compromise between vertical launch component (air time) and horizontal launch component (forward speed)."
            },
            {
                "question_type": "MCQ",
                "question_text": "How does doubling the mass of a pendulum bob affect its period of oscillation?",
                "options_json": json.dumps(["It doubles the period", "It halves the period", "It increases it by 1.4 times", "It has no effect on the period"]),
                "correct_answer": "It has no effect on the period",
                "explanation": "Inertia and gravity scale proportionally with mass, canceling out, meaning only length and gravity affect a pendulum's period."
            },
            {
                "question_type": "MCQ",
                "question_text": "In a vacuum, if a heavy bowling ball and a feather are dropped from the same height, which hits the ground first?",
                "options_json": json.dumps(["Bowling ball", "Feather", "Both hit at the exact same time", "It depends on wind speed"]),
                "correct_answer": "Both hit at the exact same time",
                "explanation": "In a vacuum, air resistance is absent. All items experience the same gravitational acceleration of ~9.8 m/s^2."
            },
            {
                "question_type": "MCQ",
                "question_text": "What is the acceleration rate of an object in free fall on Earth?",
                "options_json": json.dumps(["4.9 m/s^2", "9.8 m/s^2", "1.6 m/s^2", "19.6 m/s^2"]),
                "correct_answer": "9.8 m/s^2",
                "explanation": "The standard acceleration of gravity near Earth's surface is approximately 9.8 m/s^2."
            },
            {
                "question_type": "MCQ",
                "question_text": "If you increase the length of a pendulum's string, the pendulum will swing...",
                "options_json": json.dumps(["Slower (longer period)", "Faster (shorter period)", "The same speed", "In a circle"]),
                "correct_answer": "Slower (longer period)",
                "explanation": "The period of a pendulum is proportional to the square root of its length. A longer string means a longer time per swing."
            }
        ]
    else: # ds-visualizer
        questions = [
            {
                "question_type": "MCQ",
                "question_text": "What does LIFO stand for in relation to Stacks?",
                "options_json": json.dumps(["Last In First Out", "List In File Out", "Last In Fast Operations", "Log In Fail Output"]),
                "correct_answer": "Last In First Out",
                "explanation": "A stack operates on Last-In, First-Out, where the most recently added item is the first to be retrieved (like plates)."
            },
            {
                "question_type": "MCQ",
                "question_text": "Which data structure follows a First-In, First-Out (FIFO) access pattern?",
                "options_json": json.dumps(["Stack", "Queue", "Binary Search Tree", "Linked List"]),
                "correct_answer": "Queue",
                "explanation": "A queue operates on First-In, First-Out, where items are appended to the rear and removed from the front (like a line)."
            },
            {
                "question_type": "MCQ",
                "question_text": "What is the average search complexity of a Balanced Binary Search Tree?",
                "options_json": json.dumps(["O(1)", "O(N)", "O(N log N)", "O(log N)"]),
                "correct_answer": "O(log N)",
                "explanation": "Searching a balanced BST eliminates half the tree branches at each step, yielding logarithmic search complexity."
            },
            {
                "question_type": "MCQ",
                "question_text": "In a Linked List, what does each node contain besides its data value?",
                "options_json": json.dumps(["A pointer to the parent node", "A pointer to the next node", "An index number", "A hash value"]),
                "correct_answer": "A pointer to the next node",
                "explanation": "A singly linked list node contains the stored value and a reference (pointer) to the next node in the sequence."
            },
            {
                "question_type": "MCQ",
                "question_text": "What is recursion?",
                "options_json": json.dumps(["A loop that runs forever", "A function that calls itself", "An array index lookup", "A type of sorting algorithm"]),
                "correct_answer": "A function that calls itself",
                "explanation": "Recursion is a programming technique where a function calls itself directly or indirectly to solve subproblems."
            }
        ]

    for q in questions:
        db_q = models.QuizQuestion(
            course_id=course_id,
            question_type=q["question_type"],
            question_text=q["question_text"],
            options_json=q["options_json"],
            correct_answer=q["correct_answer"],
            explanation=q["explanation"]
        )
        db.add(db_q)
    db.commit()
