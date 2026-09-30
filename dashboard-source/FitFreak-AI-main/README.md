# FitFreak AI

FitFreak AI is a privacy-aware, gamified fitness application built with React 19, Vite 7, Express 5, MongoDB, and local Ollama inference. It turns a user's profile and primary goal into weekly plans, measurable daily missions, real progress views, XP, streaks, and contextual fitness guidance.

## Architecture

```text
React / Vite frontend
        ↓  /api
Express backend (authentication, validation, context allowlist)
        ├── MongoDB (users, goals, plans, missions, weights, chat)
        └── Ollama http://127.0.0.1:11434
                    ↓
                qwen3:4b
```

The browser never calls Ollama directly. The backend creates an allowlisted context from saved profile, goal, task, workout, progress, and weight data; retrieves relevant local Markdown knowledge; applies the FitFreak safety prompt; and sends that package to Ollama with `think: false` and `stream: false`. No OpenAI or cloud-AI key is used.

## Requirements

- Node.js 22.12 or newer
- MongoDB available locally or through a configured `MONGODB_URI`
- [Ollama](https://ollama.com/) running locally
- The `qwen3:4b` model: `ollama pull qwen3:4b`

Verify local AI:

```bash
curl http://127.0.0.1:11434/api/tags
```

## Local setup

```bash
npm run setup
npm run dev:local
```

In another terminal:

```bash
npm run dev
```

Open `http://localhost:5173`. The Vite development server proxies `/api` to `http://127.0.0.1:8000`.

`npm run dev:local` prepares `server/.env`, starts or connects to loopback MongoDB, and launches the API. Alternatively, copy `server/.env.example` to `server/.env`, set the values, and run `npm run dev:server`.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB connection | `mongodb://127.0.0.1:27017/fitfreak-ai` |
| `JWT_SECRET` | JWT signing secret | required |
| `PORT` | Express port | `8000` |
| `OLLAMA_URL` | Local Ollama origin | `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | Required chat model | `qwen3:4b` |
| `OLLAMA_TIMEOUT_MS` | Inference timeout | `120000` |

## Product journey

1. Register or sign in.
2. Complete the three-step fitness onboarding.
3. Choose a primary goal; weight loss opens target and measurement questions.
4. FitFreak saves the goal and creates the first personalized week.
5. The dashboard creates that day's measurable missions from the saved profile and plan.
6. Completing a mission updates XP, level, streak, and achievement progress.
7. Record weight in Progress to build the weight journey and goal percentage.
8. Ask FitFreak AI. Saved fitness context is used when available; missing facts are not invented.

## API highlights

- `GET /api/ai/health` checks Ollama and confirms `qwen3:4b` exists.
- `POST /api/chat` sends a real local-model request and returns `503` if local AI is unavailable.
- `GET /api/tasks/today` creates or returns persistent personalized missions.
- `PATCH /api/tasks/:id` records completion and updates XP safely.
- `GET|PUT /api/weights` reads or records real measurements.

## Safety and privacy

FitFreak AI provides general fitness and wellness information. It is not a doctor, does not diagnose illness, prescribe medication, or replace qualified care. The system prompt directs emergencies to urgent local help and rejects dangerous restriction, dehydration, purging, unsafe rapid weight loss, and excessive exercise. Women's Wellness records are deliberately excluded from AI context.

Local inference improves privacy, but the web app and MongoDB remain separate application components; FitFreak does not claim that every part of the stack runs on-device.

## Verification

```bash
npm run lint
npm test
npm run build
```

See [docs/AI_ARCHITECTURE.md](docs/AI_ARCHITECTURE.md) for the AI request path and context boundary.
