# VedaAI Assessment: AI-Powered Grading Assistant 🚀

Welcome to the **VedaAI Assessment** platform! This application acts as a digital teaching assistant, automating the tedious process of extracting, mapping, and grading handwritten student answer sheets against question papers. 

🔗 **[Watch the Live Demo Here](https://drive.google.com/file/d/1kDW0xGaMxI1KszPXYj-7MM4qAImELCBg/view?usp=sharing)**

---

## 🧠 The AI Orchestration Pipeline

The true magic of VedaAI lies in its **Three-Stage AI Orchestration**. Instead of relying on a single, massive, error-prone AI prompt, the application breaks down the complex task of grading into three distinct, specialized AI agents powered by **Gemini 3.1 Flash Lite**. 

This orchestration ensures high accuracy, fast response times, and an incredibly robust user experience.

### Stage 1: Question Extraction (The "Reader")
When a teacher uploads a Question Paper PDF, the first AI agent acts as a reader. 
- **The Goal:** Read the document and extract a structured array of questions.
- **Structured Output:** It strictly returns JSON containing the Question ID, the human-readable Question Number (e.g., "Q1"), the full text of the question, and the maximum marks allocated to it.
- **Why it matters:** This establishes the ground-truth rubric that the rest of the pipeline will grade against.

### Stage 2: Spatial Answer Extraction (The "Scanner")
When the student's handwritten Answer Sheet is uploaded, the second AI agent steps in. 
- **The Goal:** Scan every page, transcribe the handwriting, and—most importantly—calculate **bounding boxes** for every discrete block of text.
- **Spatial Reasoning:** It returns the `x, y, width, height` coordinates of each answer. This allows the frontend UI to draw precise highlight boxes over the original document, letting the teacher visually verify what the AI read.
- **Robustness:** This agent does *not* attempt to figure out which answer belongs to which question. It simply acts as an objective scanner, transcribing what it sees.

### Stage 3: Semantic Mapping & AI Grading (The "Teacher")
This is the most powerful agent in the pipeline. It takes the output from Stage 1 (The Questions) and Stage 2 (The Transcribed Answer Blocks) and performs deep reading comprehension.
- **Semantic Matching:** Instead of dumbly looking for "Q1" labels, it actually reads the student's answer and semantically matches it to the correct question context. Even if a student's answer spills across multiple pages, this agent intelligently groups those blocks together!
- **Automated Grading:** It acts as a teacher, evaluating the answer against the question and awarding **Earned Marks** out of the maximum possible.
- **Personalized Feedback:** In a single, highly optimized pass, it generates:
  - Specific feedback for *every* question (e.g., *"Excellent work! You correctly used the elimination method."*)
  - An Error Type classification (e.g., "Calculation Error", "Incomplete", "Not Attempted")
  - An overall **Strengths** and **Areas for Improvement** summary for the student.

---

## 🏗️ Technical Highlights

### 1. Guaranteed Structured JSON via Schema Type
All AI interactions utilize the `@google/generative-ai` SDK's `responseSchema` feature. By defining strict JSON schemas (e.g., `SchemaType.OBJECT`, `SchemaType.ARRAY`), we guarantee that Gemini always returns predictable, parseable data structures. There is zero risk of the AI returning conversational text that breaks the frontend!

### 2. Exponential Backoff & Resilience
Real-world APIs experience rate limits (429) and temporary outages (503). VedaAI implements an **Exponential Backoff Algorithm** on all API routes. If the AI is temporarily overwhelmed while processing a 10-page answer sheet, the system automatically catches the error, waits a few seconds, and retries the specific page without crashing the application or losing the user's progress.

### 3. Continuous Spatial Rendering
The frontend utilizes a continuous-scroll canvas for multi-page answer sheets. When a teacher clicks on an extracted question, the UI automatically calculates the bounding box of the student's answer, clamps the AI-generated coordinates between `0.0` and `1.0` to prevent layout overflow, and instantly smoothly scrolls the exact answer block into the center of the viewport!

### 4. Zero-Latency Report Generation
The beautiful AI Student Report Modal—complete with grade tracking, Strengths, Improvements, and Error Type pills—is generated without making a secondary API call. The Stage 3 "Teacher" agent is instructed to generate all report analytics in the exact same pass as the grading logic, saving latency and API costs.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS
- **AI Models:** Gemini 3.1 Flash Lite
- **State Management:** React Hooks (In-memory, no DB required)

---

## 🚀 Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_key_here
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Upload a Question Paper, upload an Answer Sheet, and watch the AI Orchestration do the heavy lifting!
