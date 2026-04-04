# AI Resume Analyzer

Full-stack resume analysis app with a React dashboard frontend and an Express backend using the OpenAI API.

## Features

- Upload a PDF resume
- Extract resume text on the server
- Analyze the resume with OpenAI
- Return:
  - score
  - skills
  - missing skills
  - improvement suggestions
- Show results in a dashboard-style UI
- Download a PDF analysis report
- Download an improved ATS-friendly resume draft

## Structure

- `client` - React + Vite frontend
- `server` - Express API for upload, PDF parsing, OpenAI analysis, and PDF export

## Setup

1. Install dependencies from the repo root:

```bash
npm install
```

2. Create `server/.env` from `server/.env.example`

3. Add your OpenAI API key to `server/.env`

4. Start the full stack app:

```bash
npm run dev
```

## URLs

- Client: `http://localhost:5173`
- Server: `http://localhost:5000`

## Deployment

This project is set up for Netlify deployment.

1. Push the repository to GitHub
2. Import the repo into Netlify
3. Set these Netlify environment variables:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (optional, default `gpt-4o-mini`)
   - `CLIENT_URL` (set this to your Netlify site URL after the first deploy)
4. Deploy

Netlify will:

- build the React app from `client`
- serve the frontend from `client/dist`
- run the Express API as a serverless function from `server/netlify-functions`

No API key is committed to git. Keep it only in `server/.env` locally and in Netlify environment variables for production.

## Environment variables

```bash
PORT=5000
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```
