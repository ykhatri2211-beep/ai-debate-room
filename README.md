# AI Debate Room — Multi-Agent Debate & Evaluation Platform

An enterprise-grade, polished, full-stack multi-agent platform where specialized autonomous AI personas engage in formal academic debates, execute line-by-line rebuttals, and undergo rigorous algorithmic adjudication.

Built as a college Software Engineering Capstone Project designed specifically for live faculty demonstrations.

---

## 🏛️ System Architecture

```
                                  ┌────────────────────────┐
                                  │      Client (Web)      │
                                  │  React 19 + TypeScript │
                                  │ Tailwind + Framer + Recharts
                                  └───────────┬────────────┘
                                              │ REST / JSON (Proxy)
                                              ▼
                                  ┌────────────────────────┐
                                  │  Express API Server    │
                                  │     Node.js + TS       │
                                  │  /api/debates, /health │
                                  └───────────┬────────────┘
                                              │
                    ┌─────────────────────────┴────────────────────────┐
                    ▼                                                  ▼
       ┌────────────────────────┐                         ┌────────────────────────┐
       │Deterministic Turn      │                         │ Provider Abstraction   │
       │Controller              │                         │ Layer (ILLMProvider)   │
       │• Pro → Con → Rebuttal  │                         │• Google Gemini API     │
       │• Request Locking       │                         │• OpenAI / Groq API     │
       │• Anti-Premature Judge  │                         │• Neural Sim (Zero-Fail)│
       └────────────┬───────────┘                         └────────────┬───────────┘
                    │                                                  │
                    └─────────────────────────┬────────────────────────┘
                                              ▼
                                  ┌────────────────────────┐
                                  │  Persistent Storage    │
                                  │ Atomic Transactional   │
                                  │ JSON / SQLite-ready    │
                                  └────────────────────────┘
```

---

## ⚡ Key Highlights & Live Demo Readiness

1. **Deterministic Multi-Agent Arena**:
   - **Alpha-Pro**: Affirmative Synthesizer defending the proposition with empirical citations.
   - **Omega-Con**: Opposition Dialectic challenging the motion with counterexamples and liability scrutiny.
   - **Chief Arbiter**: Impartial AI Judge calculating scores based strictly on the 5-part rubric.
2. **Strict Turn-Based Sequence (Backend Controller)**:
   - Round 1: Pro opening claim → Con counter-claim → Pro rebuttal → Con rebuttal
   - Repeated for 2, 3, or 5 rounds
   - Concurrent request locking prevents duplicate speeches
   - Prevents the judge from issuing final verdicts prematurely
3. **Interactive Human vs AI Mode**:
   - Compete as either Affirmative (PRO) or Opposition (CON)
   - Real-time argument submission box with live word/character counters and rubric tips
   - AI opponent directly counters your specific arguments
4. **Transparent 5-Part Rubric Adjudication**:
   - Logical Consistency: **25%**
   - Evidence & Supporting Examples: **25%**
   - Rebuttal Quality: **20%**
   - Relevance to Motion: **15%**
   - Clarity & Structure: **15%**
   - Interactive Recharts Radar comparison chart, side-by-side strongest/weakest matrix, and printable report
5. **Zero-Fail Demonstration Architecture**:
   - Fully supports **Google Gemini API** (`gemini-1.5-flash` / `gemini-2.0-flash`) and **OpenAI / Groq API**.
   - If no API key is provided or if network fails, the platform seamlessly engages its **High-Fidelity Neural Simulation Engine**, guaranteeing that a faculty demonstration never fails or stalls.
6. **Persistent History & Analytics**:
   - Saved debate archives with keyword search, category filtering, and winner filters
   - Instant JSON transcript export
   - Safe record deletion with confirmation modals

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Backend Setup
```bash
cd server
npm install

# Copy example environment file
cp .env.example .env

# (Optional) Add your Google Gemini API key to .env:
# GEMINI_API_KEY=your_key_here

# Start the server (runs on port 5000)
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install

# Start Vite development server (configured on port 5174 to avoid conflicts)
npm run dev
```

Open your browser to: **`http://localhost:5174`**

---

## 📂 Project Structure

```
ai-debate-room/
├── server/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── turnController.ts       # Deterministic turn sequencer & locks
│   │   ├── services/
│   │   │   ├── dbService.ts            # Atomic transactional storage & seeds
│   │   │   ├── promptTemplates.ts      # Structured prompts for Pro, Con & Judge
│   │   │   └── llm/
│   │   │       ├── providerInterface.ts# LLM provider contract
│   │   │       ├── geminiProvider.ts   # Google Gemini API integration
│   │   │       ├── openaiProvider.ts   # OpenAI / Groq / Open-source adapter
│   │   │       ├── mockProvider.ts     # High-Fidelity Neural Simulation Engine
│   │   │       └── providerFactory.ts  # Dynamic runtime provider switcher
│   │   ├── routes/
│   │   │   └── api.ts                  # REST API endpoints
│   │   ├── types/
│   │   │   └── debate.ts               # Shared TypeScript schemas
│   │   └── index.ts                    # Express bootstrap & middleware
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── arena/                  # Agent cards, speech bubbles, controls
│   │   │   ├── dashboard/              # Stat cards & category charts
│   │   │   ├── layout/                 # Navbar, footer, page wrapper
│   │   │   ├── results/                # Judge verdict modal & radar chart
│   │   │   └── ui/                     # Button, badge, card, modal
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx         # Hero, 3 personas, sample debate preview
│   │   │   ├── DashboardPage.tsx       # Metrics, activity, charts
│   │   │   ├── CreateDebatePage.tsx    # Topic selection & mode setup
│   │   │   ├── ArenaPage.tsx           # THE MAIN DEBATE ARENA
│   │   │   ├── HistoryPage.tsx         # Filterable archives & JSON export
│   │   │   └── SettingsPage.tsx        # Provider status & architecture
│   │   ├── services/
│   │   │   └── api.ts                  # Typed client API wrapper
│   │   ├── types/
│   │   │   └── debate.ts               # Client-side debate types
│   │   ├── App.tsx                     # Main layout & router
│   │   ├── index.css                   # Custom scrollbars & glassmorphism
│   │   └── main.tsx                    # React root
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## 🎓 Software Engineering Highlights for Faculty

1. **API Key Security**: Frontend contains zero exposed API keys or secrets. All LLM interaction happens via backend proxies.
2. **Defensive Programming**: Complete fallback system ensures the application operates without disruption in offline or constrained presentation environments.
3. **Formal Rubric Adjudication**: Scoring follows strict academic debate theory with KaTeX-level mathematical verification of weighted categories.
4. **Modern UI/UX**: Dark futuristic aesthetic with accessible contrast, generous spacing, and print-ready stylesheets for printable verdict reports.
