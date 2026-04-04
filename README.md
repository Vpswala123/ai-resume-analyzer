# AI Resume Analyzer

Full-stack resume analysis app with a React dashboard frontend and an Express backend powered by a local Ollama model.

## Structure

- `client` - React + Vite dashboard UI
- `server` - Express API for resume upload, PDF extraction, OpenAI analysis, and job matching

## Setup

1. Install dependencies:

```bash
npm install
npm run install:all
```

2. Create `server/.env` from `server/.env.example`

3. Make sure Ollama is running locally and the configured model is installed

4. Start the app:

```bash
npm run dev
```

Client runs on `http://localhost:5173` and server runs on `http://localhost:5000`.
