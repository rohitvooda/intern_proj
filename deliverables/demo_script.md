# Demo Script - AI ScienceVerse Showcase (5-Minute Walkthrough)

This script provides a step-by-step narrative script for presenting **AI ScienceVerse** to the AI Model Development Contest 2026 judges.

---

## Part 1: Introduction (Time: 0:00 - 1:00)

**Presenter actions:**
1. Open the homepage of the application.
2. Highlight the title, dynamic cards, and floating badges.

**Narrative:**
> "Good day, esteemed judges. Modern science education struggles with passive content: students look at flat diagrams and memorize formulas. Today, I am thrilled to present **AI ScienceVerse**, an immersive learning platform that turns students into explorers. Built on Next.js, FastAPI, and Supabase, the app uses 3D models, physics simulations, and generative AI to deliver personalized scientific guidance."

---

## Part 2: Authentication & Gamified Hub (Time: 1:00 - 1:45)

**Presenter actions:**
1. Log in using a test account (e.g. `jane_doe`).
2. Redirect to the Dashboard page.
3. Hover over the **XP bar**, **Badge achievements**, and **AI learning path** panel.

**Narrative:**
> "We enter the student portal. Right away, you are greeted with a gamified learning hub. We track active streaks, levels, and score stats. Below, we see badges like 'Biology Genius' or 'Code Architect' waiting to be unlocked. Most importantly, the platform queries our backend AI Agent to construct a **Personalized Learning Path** unique to this user. We also have an **AI Weakness Report** that logs incorrect answers from previous quizzes to generate custom flashcards."

---

## Part 3: Biology Cell Explorer & 3D (Time: 1:45 - 2:45)

**Presenter actions:**
1. Click **Cell Explorer** in the navbar.
2. Drag the 3D cell model to rotate it, scroll to zoom, and click the **Mitochondria**.
3. Point out the function and interesting fact.
4. Click **Explain Like I'm 10** and toggle **Read Aloud**.

**Narrative:**
> "Let's open our first module: the Biology Cell Explorer. Using React Three Fiber and WebGL, we render a eukaryotic cell. Students can rotate and zoom to dissect structures. If we click an organelle—like the Mitochondria—its functions and facts slide in. 
> To support different age groups, we click 'Explain Like I'm 10'. The AI Agent translates complex terms into a school-level analogy. We can also hit 'Read Aloud' to read the text out loud using browser-native text-to-speech."

---

## Part 4: Physics Lab & CS Visualizer (Time: 2:45 - 4:00)

**Presenter actions:**
1. Navigate to **Physics Lab**. Adjust gravity and angle sliders, then click **Simulate**.
2. Point out the real-time Recharts graph plotting the trajectory.
3. Ask the AI Tutor a question: *'Why does launch angle peak range at 45°?'*
4. Quick tour of the **DS Visualizer**, insert a node in the Binary Search Tree, and show the traversal animation.

**Narrative:**
> "In the Physics Lab, equations come to life. We can simulate projectiles, pendulums, or free fall. By dragging velocity or gravity sliders, the simulation redraws in real time, plotting distance and speed on our Recharts graph. Our integrated AI Tutor can explain the math, helping students understand *why* parameters affect results.
> Next, in the Data Structure Visualizer, students see how computer memory works. They can insert or delete elements in arrays, stacks, or Binary Search Trees, watching the pointer paths animate step-by-step."

---

## Part 5: Quiz Completion & Wrap-up (Time: 4:00 - 5:00)

**Presenter actions:**
1. Click **Take Quiz** inside the Biology Cell Explorer.
2. Answer the questions, click **Submit**.
3. Show the unlocked badge pop-up and updated XP on the dashboard.

**Narrative:**
> "To close the learning loop, each module features a quiz. The FastAPI engine grades answers instantly. When we score over 60%, the system awards XP, triggers a level-up, and unlocks the 'Biology Genius' badge. 
> By combining interactive 3D, live variables, gamification, and an AI companion, AI ScienceVerse redefines self-paced STEM learning. Thank you, and I welcome your questions."
