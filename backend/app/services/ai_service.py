import time
import httpx
import json
import logging
from typing import Dict, Any, List, Optional
from backend.app.config import settings

logger = logging.getLogger(__name__)

# Simple in-memory cache
_ai_cache: Dict[str, Any] = {}

# Rate limiter tracking (simple per-route tracking)
_rate_limiter: Dict[str, float] = {}

class AIService:
    @staticmethod
    def _check_rate_limit(client_id: str, limit_seconds: int = 2) -> bool:
        """Simple rate limiter to prevent spamming AI requests"""
        now = time.time()
        last_request = _rate_limiter.get(client_id, 0.0)
        if now - last_request < limit_seconds:
            return False
        _rate_limiter[client_id] = now
        return True

    @staticmethod
    async def call_gemini(prompt: str, system_instruction: Optional[str] = None) -> str:
        """Call Gemini API using HTTP client"""
        if not settings.GEMINI_API_KEY:
            raise ValueError("Gemini API key is not configured")
        
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        
        headers = {"Content-Type": "application/json"}
        
        contents = [{"parts": [{"text": prompt}]}]
        
        payload: Dict[str, Any] = {
            "contents": contents
        }
        
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }
            
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                data = response.json()
                try:
                    text = data['candidates'][0]['content']['parts'][0]['text']
                    return text
                except (KeyError, IndexError) as e:
                    logger.error(f"Error parsing Gemini response: {e}, response: {data}")
                    raise ValueError("Failed to parse Gemini response structure")
            else:
                logger.error(f"Gemini API returned error code {response.status_code}: {response.text}")
                raise ValueError(f"Gemini API error: {response.text}")

    @staticmethod
    async def call_openai(prompt: str, system_instruction: Optional[str] = None) -> str:
        """Call OpenAI API using HTTP client"""
        if not settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API key is not configured")
        
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}"
        }
        
        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.7
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            if response.status_code == 200:
                data = response.json()
                try:
                    return data['choices'][0]['message']['content']
                except (KeyError, IndexError) as e:
                    logger.error(f"Error parsing OpenAI response: {e}")
                    raise ValueError("Failed to parse OpenAI response structure")
            else:
                logger.error(f"OpenAI API returned error code {response.status_code}: {response.text}")
                raise ValueError(f"OpenAI API error: {response.text}")

    @classmethod
    async def get_ai_completion(cls, prompt: str, system_instruction: Optional[str] = None, cache_key: Optional[str] = None) -> str:
        """Gets AI completion using Gemini, OpenAI, or falls back to an intelligent mock system"""
        # 1. Check cache
        if cache_key and cache_key in _ai_cache:
            logger.info(f"Cache hit for key: {cache_key}")
            return _ai_cache[cache_key]
        
        # Rate limit safety
        cls._check_rate_limit("global_ai", limit_seconds=1)

        # 2. Try Gemini
        if settings.GEMINI_API_KEY:
            try:
                res = await cls.call_gemini(prompt, system_instruction)
                if cache_key:
                    _ai_cache[cache_key] = res
                return res
            except Exception as e:
                logger.warning(f"Gemini failed, falling back. Error: {e}")

        # 3. Try OpenAI
        if settings.OPENAI_API_KEY:
            try:
                res = await cls.call_openai(prompt, system_instruction)
                if cache_key:
                    _ai_cache[cache_key] = res
                return res
            except Exception as e:
                logger.warning(f"OpenAI failed, falling back. Error: {e}")

        # 4. Local Smart Mock fallback if no API keys are available
        logger.warning("No API keys set or APIs failed. Falling back to local smart generator.")
        mock_res = cls._generate_smart_mock(prompt, system_instruction)
        if cache_key:
            _ai_cache[cache_key] = mock_res
        return mock_res

    @classmethod
    def _generate_smart_mock(cls, prompt: str, system_instruction: Optional[str]) -> str:
        """Generates contextual educational mock answers based on keywords in prompt"""
        prompt_lower = prompt.lower()
        
        # 1. Organelle Explanations (Biology Cell Explorer)
        if "explain" in prompt_lower and any(o in prompt_lower for o in ["nucleus", "mitochondria", "ribosome", "membrane", "golgi", "endoplasmic"]):
            if "nucleus" in prompt_lower:
                return """### 🧠 The Nucleus: The Brain of the Cell

Imagine the **Nucleus** is like the main office of your school, or the mayor's office in a city. It contains all the instructions (like blueprints or recipe books) for how to build and run the entire cell.

*   **What it does:** It holds the **DNA** (your genetic instructions). It controls what the cell does, how it grows, and when it reproduces.
*   **Fun Analogy:** It's like the Control Center in a video game console, managing all the action!
*   **Key Concept:** Without the nucleus, the cell wouldn't know how to make proteins, grow, or survive. It's the ultimate boss!"""
            elif "mitochondria" in prompt_lower:
                return """### ⚡ The Mitochondria: The Powerhouse of the Cell

The **Mitochondria** are like the power plants of a city, or the battery pack inside your favorite gaming controller.

*   **What it does:** It takes food (like sugar/glucose) and converts it into a type of energy the cell can actually use, called **ATP**.
*   **Fun Analogy:** Think of them as tiny cellular engines burning fuel (food) to make electricity!
*   **Cool Fact:** Mitochondria have their own special DNA, which is different from the DNA in the nucleus! Scientists think they used to be independent bacteria millions of years ago."""
            elif "ribosome" in prompt_lower:
                return """### 🏗️ Ribosomes: The Protein Builders

**Ribosomes** are like tiny factory workers or 3D printers inside the cell.

*   **What they do:** They read the instructions sent from the nucleus and use them to construct **proteins**. Proteins are the building blocks needed to repair structures and run chemical reactions.
*   **Fun Analogy:** They are like chefs following a recipe (mRNA) to cook a delicious, nutritious meal (protein) for the cell!
*   **Cool Fact:** There are millions of ribosomes floating around or attached to membranes in just a single cell!"""
            elif "membrane" in prompt_lower:
                return """### 🛡️ Cell Membrane: The Gatekeeper

The **Cell Membrane** is like the security guard at the entrance of a theme park, or the walls and doors of your house.

*   **What it does:** It wraps around the cell and decides what is allowed to enter (like nutrients and water) and what has to stay out (like viruses and waste).
*   **Fun Analogy:** It's a selective filter. If you're a friend (nutrient), come on in! If you're a foe (toxin), you're blocked!
*   **Cool Fact:** It is made of a double layer of fats (lipids) that acts like water-resistant bubble wrap to protect the cell."""
            elif "golgi" in prompt_lower:
                return """### 📦 Golgi Apparatus: The Post Office

The **Golgi Apparatus** (or Golgi Body) is the cell's packaging and shipping department. It acts exactly like an Amazon Fulfillment Center or your local Post Office.

*   **What it does:** It takes proteins and lipids made by other parts of the cell, modifies them (like wrapping them in bubble wrap), packs them into packages called *vesicles*, and labels them so they go to the right address.
*   **Fun Analogy:** The Golgi is the shipping coordinator that stamps your packages with a barcode and sends them out on the delivery truck!
*   **Cool Fact:** It is named after Camillo Golgi, an Italian scientist who discovered it in 1898 using a special staining technique."""
            elif "endoplasmic" in prompt_lower or " er " in prompt_lower:
                return """### 🛣️ Endoplasmic Reticulum (ER): The Highway System

The **Endoplasmic Reticulum** is like a massive highway and factory system combined. It is a network of folded membranes running throughout the cell.

*   **What it does:** 
    *   **Rough ER** (covered in ribosomes, so it looks bumpy) helps build and transport *proteins*.
    *   **Smooth ER** (no ribosomes, looks smooth) makes *fats* and helps clean up toxins.
*   **Fun Analogy:** It's like a conveyor belt system in a factory that carries items from one assembly line directly to the shipping department!
*   **Cool Fact:** The ER is connected directly to the outer wall of the nucleus, allowing fast transport of instructions."""

        # 2. Physics Simulation Explanations
        if "projectile" in prompt_lower or ("angle" in prompt_lower and "range" in prompt_lower):
            return """### 🚀 Physics Insight: Launch Angles and Range

When you increase the launch angle of a projectile (like a cannonball), two competing factors come into play:

1.  **Vertical Velocity:** A higher angle launches the ball higher into the air. This gives it **more air time** (hang time).
2.  **Horizontal Velocity:** A higher angle reduces how fast the ball moves forward. 

**Why does the range increase then decrease?**
*   At low angles (e.g., $15^\\circ$), the ball moves forward quickly but hits the ground almost immediately because it has no hang time.
*   At high angles (e.g., $75^\\circ$), the ball goes super high in the air, but it travels forward so slowly that it lands close to the launcher.
*   **The Sweet Spot ($45^\\circ$):** The maximum distance is achieved at exactly $45^\\circ$ (in a vacuum) because it provides the perfect mathematical balance between hang time and forward speed!"""
        
        if "pendulum" in prompt_lower or "mass" in prompt_lower:
            return """### ⏳ Physics Insight: Pendulum Period and Mass

One of the most surprising discoveries in physics (first noted by Galileo!) is that **the mass of the pendulum bob does NOT affect the period of its swing**.

**Here is why:**
1.  **Gravity's Pull:** A heavier mass experiences a stronger gravitational force pulling it downward.
2.  **Inertia's Resistance:** A heavier mass also has more inertia, which means it requires *more force* to accelerate.
3.  **The Perfect Cancelation:** These two effects cancel each other out perfectly! The acceleration of the bob is always the same, regardless of how heavy it is.
4.  **What DOES affect the swing?** Only the **length of the string** and the **strength of gravity** determine how fast a pendulum swings. A longer string means a slower swing."""

        if "free fall" in prompt_lower or "gravity" in prompt_lower:
            return """### 🍎 Physics Insight: Free Fall and Gravity

In a true **free fall** (where there is no air resistance), all objects accelerate downward at the exact same rate: **$9.8\\text{ m/s}^2$** on Earth.

*   **Why is this?** Just like with the pendulum, a heavier object (like a bowling ball) is pulled by gravity with more force than a light object (like a feather). However, the bowling ball's larger mass makes it harder to move (inertia). The ratio of force to mass is identical, leading to the same acceleration!
*   **Air Resistance:** In the real world, a feather falls slower because the air pushes up against its wide, light surface, creating drag that fights gravity. If you drop them in a vacuum chamber, they land at the exact same millisecond!"""

        # 3. Data Structure Explanations
        if "recursion" in prompt_lower:
            return """### 🌀 Understanding Recursion (Simply!)

**Recursion** is a programming technique where a function calls **itself** to solve a smaller version of the same problem. 

Think of it like a set of **Russian nesting dolls (Matryoshka dolls)**:
1.  To get to the smallest doll inside, you have to open the outer doll, then the next smaller doll, and the next.
2.  Opening each doll is like the function calling itself with a smaller input.
3.  **The Base Case:** The smallest doll that cannot be opened is the "base case". This is when the function stops calling itself and starts returning results back up the chain.

**Code Example (Factorial):**
```python
def factorial(n):
    if n == 1:       # Base Case: Stop here!
        return 1
    return n * factorial(n - 1)  # Recursive Call!
```
Without a base case, recursion would loop forever, causing a **Stack Overflow**!"""

        if "tree" in prompt_lower or "bst" in prompt_lower:
            return """### 🌳 Binary Search Tree (BST)

A **Binary Search Tree** is a node-based data structure designed for fast searching, insertion, and deletion.

**The Golden Rule of BST:**
*   For any given node, all values in its **left subtree** must be **less than** its value.
*   All values in its **right subtree** must be **greater than** its value.

**Why is it so fast?**
When searching for a number, you compare it to the root. If your number is smaller, you throw away the entire right side of the tree and move left. This cuts your search space in half with every single step, giving it an average time complexity of **$O(\\log n)$**!"""

        if "stack" in prompt_lower or "queue" in prompt_lower:
            return """### 🥞 Stack vs. Queue

Think of these as two different ways to line up and process items:

1.  **Stack (LIFO - Last In, First Out):**
    *   **Analogy:** A stack of dinner plates. The last plate you put on top is the first one you wash.
    *   **Operations:** `push` (add to top), `pop` (remove from top).
    *   **Use Cases:** Browser "Back" button, Undo/Redo operations.

2.  **Queue (FIFO - First In, First Out):**
    *   **Analogy:** A line at a movie theater. The first person in line is the first to get their ticket.
    *   **Operations:** `enqueue` (add to back), `dequeue` (remove from front).
    *   **Use Cases:** Print queues, web server request processing."""

        # 4. Fallback chat tutor responses
        return """### 🌟 Welcome to the AI ScienceVerse Tutor!

I can help you explore biology, physics, computer science, or any other science topic. 

Here are some suggested topics you can ask me about:
*   "How does a **Binary Search Tree** balance itself?"
*   "Explain **projectile motion** and how gravity affects the flight path."
*   "Tell me about the **Mitochondria** and cellular respiration."

**Mini Quiz Concept:**
*Which organelle is responsible for generating energy (ATP)?*
1. Nucleus
2. Mitochondria
3. Ribosome
*Reply with the answer and I'll verify!*"""
