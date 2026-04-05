# AI Resume Analyzer

Static resume analyzer app with a React dashboard frontend. It runs entirely in the browser, so it does not require an API key, login, or backend deployment.

## Features

- Upload a PDF resume
- Extract text directly in the browser
- Analyze the resume locally with browser-side logic
- Return:
  - score
  - skills
  - missing skills
  - improvement suggestions
- Show results in a dashboard-style UI
- Deploy as a static site on Netlify or GitHub Pages

## Structure

- `client` - React + Vite frontend
- `server` - optional legacy backend files from the earlier version

## Setup

1. Install dependencies from the repo root:

```bash
npm install
```

2. Create `server/.env` from `server/.env.example`

3. Add your OpenAI API key to `server/.env`

4. Start the app:

```bash
npm run dev
```

## URL

- App: `http://localhost:5173`

## Deployment

This project can be deployed as a static site.

### Netlify

1. Push the repo to GitHub
2. Import it into Netlify
3. Build command: `npm run build --workspace client`
4. Publish directory: `client/dist`

### GitHub Pages

GitHub Actions deployment is included in `.github/workflows/deploy-pages.yml`.

To use it:

1. Push to `main`
2. In GitHub, open `Settings -> Pages`
3. Set `Source` to `GitHub Actions`
4. The site will deploy automatically on the next push

## Notes

- No API key is needed
- No user login is needed
- Resume content stays in the browser during analysis
- Analysis quality is heuristic and lightweight, which is the tradeoff for zero-cost public hosting
- NVIDIA-hosted APIs, OpenAI, and similar services still require an API key, so they do not satisfy the zero-key requirement
