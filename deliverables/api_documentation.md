# API Documentation - AI ScienceVerse RESTful endpoints

The backend of **AI ScienceVerse** is powered by FastAPI. 
- **Development Server base URL**: `http://127.0.0.1:8000/api/v1`
- **Interactive OpenAPI specification docs**: `http://127.0.0.1:8000/docs`

---

## Authentication Endpoints

### 1. Register User
- **Route**: `POST /auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "username": "alan_turing",
    "email": "alan@turing.org",
    "password": "supersecurepassword"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "username": "alan_turing",
      "email": "alan@turing.org",
      "level": 1,
      "xp": 100,
      "streak": 1
    }
  }
  ```

### 2. Login User
- **Route**: `POST /auth/login`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "username": "alan_turing",
    "password": "supersecurepassword"
  }
  ```
- **Response (200 OK)**: (Same payload containing JWT access token and user information block).

---

## Progress & Dashboard Endpoints

### 1. Get Dashboard Summary
- **Route**: `GET /progress/dashboard`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "user_id": 1,
    "username": "alan_turing",
    "level": 2,
    "xp": 350,
    "streak": 3,
    "quizzes_taken": 2,
    "average_quiz_score": 80.0,
    "badges": [
      {
        "name": "Science Explorer",
        "description": "Unlock first course milestone",
        "xp_reward": 50
      }
    ]
  }
  ```

---

## Quiz Engine Endpoints

### 1. Fetch Quiz Questions
- **Route**: `GET /quiz/questions/{course_code}`
- **Parameters**: `course_code` (e.g. `cell-explorer`, `physics-lab`, `ds-visualizer`)
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 4,
      "question_text": "What is the primary function of the Mitochondria?",
      "options": [
        "Store genetic instructions",
        "Generate cellular energy (ATP)",
        "Synthesize proteins",
        "Sort and wrap vesicles"
      ],
      "correct_answer": "Generate cellular energy (ATP)",
      "explanation": "Mitochondria act as the cell power generators, transforming glucose and oxygen into ATP energy molecules."
    }
  ]
  ```

### 2. Submit Quiz Answers
- **Route**: `POST /quiz/submit/{course_code}`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "answers": [
      {
        "question_id": 4,
        "answer": "Generate cellular energy (ATP)"
      }
    ]
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "score": 1,
    "total": 1,
    "passed": true,
    "xp_gained": 100,
    "unlocked_badges": ["Biology Genius"],
    "explanations": {
      "4": {
        "correct": true,
        "chosen": "Generate cellular energy (ATP)",
        "correct_answer": "Generate cellular energy (ATP)",
        "explanation": "Mitochondria act as the cell power generators, transforming glucose and oxygen into ATP energy molecules."
      }
    }
  }
  ```

---

## AI Action Endpoints

### 1. AI Explain Topic
- **Route**: `POST /ai/explain`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "topic": "Nucleus",
    "context": "An organelle in eukaryotic cells containing DNA.",
    "age_group": "10"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "explanation": "Imagine the nucleus is like the principal's office of a school! Inside, it stores a big master book of rules (DNA) that tells everyone what to do..."
  }
  ```

### 2. AI Tutor Conversational Q&A
- **Route**: `POST /ai/chat`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "message": "Why does a lighter ball fall at the same speed as a heavier ball in free fall?",
    "chat_history": [
      { "role": "assistant", "content": "Welcome to Physics Lab! Let's talk mechanics." }
    ],
    "context_topic": "physics-lab"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "reply": "Excellent question! In the absence of air resistance (like in a vacuum or simple free fall simulation), all objects accelerate downward at the exact same rate (g = 9.8 m/s²). Even though gravity pulls harder on the heavier object, its larger mass means it has more inertia and is harder to accelerate. These two effects balance out perfectly!"
  }
  ```

### 3. AI Personalized Learning Path
- **Route**: `POST /ai/path`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "personalized_path": "1. Biology Cell Explorer: Complete mitochondria quiz.\n2. Physics Lab: Tweak gravity to moon (1.6m/s²) and note velocity delta.\n3. DS Visualizer: Test BST searches with large random integers."
  }
  ```

### 4. AI Weakness Detection & Revision Notes
- **Route**: `POST /ai/weaknesses`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "weaknesses": [
      "Translational projectile ranges and gravitational acceleration dependency"
    ],
    "revision_notes": "🔑 QUICK TIP: The range of a projectile is inversely proportional to gravity. Moving from Earth to Mars (g=3.7) increases flight range by 2.6x!"
  }
  ```
