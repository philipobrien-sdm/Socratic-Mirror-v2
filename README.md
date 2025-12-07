# Socratic Mirror v2 🦉✨
<img width="500" height="300" alt="Screenshot 2025-12-07 110304" src="https://github.com/user-attachments/assets/7b3d16d2-7847-4015-a21c-e041bfa738be" />

**A Next-Generation Introspective Reasoning Engine**

Socratic Mirror is a tactical philosophical engine designed to facilitate self-discovery. Unlike standard chatbots that simply reply, Socratic Mirror acts as a non-judgmental mirror, using the Socratic method to help you examine the foundations of your own beliefs, feelings, and knowledge.

<img width="600" height="280" alt="Screenshot 2025-12-07 110242" src="https://github.com/user-attachments/assets/d57e4cfd-89dc-4246-9322-94753bbd54b4" />

**v2 Update:** This version introduces a robust separation between **Philosophical Logic** and **Psychological Drivers**, along with real-time controls for dialogue depth and emotional safety.

---

## 🚀 Key Features

### 🎭 Deep Socratic Profiling (v2)
The engine builds a living, dual-namespace profile of the user as they speak:
*   **Philosophy Layer**: Tracks epistemic styles, metaphysical leanings, and argument patterns.
*   **Psychology Layer**: Infers core values, emotional themes, and motivational drivers.
*   *Why?* To prevent valid logical arguments from being conflated with emotional defense mechanisms.

<img width="600" height="300" alt="Screenshot 2025-12-07 105735" src="https://github.com/user-attachments/assets/3c20978e-2fe6-4c76-8f55-24866c4fd8ca" />


### ⚓ Safety & Depth Controls
You are in the driver's seat of the inquiry:
*   **Depth Slider**: Adjust from "Surface" (concrete, practical) to "Deep" (existential, abstract).
*   **Grounding Mode**: A panic button for the soul. Toggling this shifts the AI from "Debate" to "Support," prioritizing emotional validation and immediate lived experience over abstract reasoning.

### 🔍 Live Inference & Transparency
See what the mirror sees. The "Personal Report" updates in real-time, showing you exactly which phrases triggered an inference about your "Fear of Abandonment" or your "Empiricist" worldview. You can **Disagree** with any tag to launch a meta-dialogue challenging that assessment.

### 🛡️ Privacy First Architecture
Your journey is private.
*   **Local Storage**: All chat history and psychological profiles exist *only* in your browser's LocalStorage.
*   **Export/Import**: JSON-based backup allows you to own your data completely.

---

## 🛠️ Tech Stack

*   **Frontend**: React 19, Tailwind CSS
*   **Icons**: Lucide React
*   **AI**: Google Gemini API (`gemini-3-pro-preview` for dialogue, `gemini-2.5-flash` for analysis)
*   **Architecture**: Client-side SPA (Single Page Application) using ES Modules.

---

## ⚡ Setup & Usage

### Prerequisites
*   A modern web browser (Chrome/Edge/Firefox).
*   A Google Gemini API Key.

### Running the App
1.  **Clone/Download**: Get the source code.
2.  **Environment**: The application expects the API key to be available via `process.env.API_KEY`.
3.  **Serve**: Since this project uses ES Modules and Import Maps, you must serve it via a local web server (e.g., `npx serve`, `python -m http.server`, or Live Server extension in VS Code). Opening `index.html` directly as a file may not work due to CORS policies on module imports.

### How to Use
1.  **Define Yourself**: Start by entering a belief ("I believe justice is objective") or a feeling ("I feel anxious about the future").
2.  **The Dialogue**: The AI will ask probing questions. Answer honestly.
3.  **Check the Mirror**: Open the **Profile v2** to see your "Philosophy" and "Psychology" tabs populating.
4.  **Adjust**: If the questioning gets too intense, toggle **Grounding Mode** in the sidebar.

---

## ⚠️ Disclaimer

**Socratic Mirror is a philosophical reasoning tool, not a mental health service.**
While it infers "vulnerabilities" or "drivers" based on text patterns, these are heuristics for conversation, not clinical diagnoses. Do not use this tool as a substitute for professional therapy or psychological advice.

---
*Built with ❤️ using the Google Gemini API*
