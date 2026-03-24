# Work From Anywhere — Voice-Powered Coding Agent

> **LevelNext Hackathon 2026 Submission**
> Built in 48 hours · March 2026

---

## What is it?

**Work From Anywhere** is a voice-controlled coding agent that lets you ship code from your phone while your laptop does the work at home.

You speak a task. A coding agent on your laptop receives it, writes real files, commits them to GitHub, and sends a summary back to your phone — all in seconds.

No IDE. No terminal. No desk required. Just your voice, and an agent that never stops building.

---

## How it works

```
Phone (voice)
    │
    ▼
Web Speech API captures voice command
    │
    ▼
FastAPI Relay Server (localhost:8000)
    │  ├── Receives task via POST /task
    │  ├── Opens WebSocket /ws/{session_id}
    │  └── Broadcasts live status updates
    │
    ▼
Coding Agent (Python — runs on your laptop)
    │  ├── Calls LLM with task + system prompt
    │  ├── Parses JSON response
    │  └── Writes real files to workspace/
    │
    ▼
Git Helper
    │  ├── git add .
    │  ├── git commit -m "feat: ..."
    │  └── git push origin main
    │
    ▼
GitHub Repository (live commit)
    │
    ▼
Summary pushed back to phone via WebSocket
    │
    ▼
Browser notification: "Done — 2 files written"
```

---

## Demo

1. Open the app on your phone
2. Create a project
3. Tap the mic button
4. Say: *"Create a navbar with Home, About, and Contact links using Tailwind CSS"*
5. Watch the commit appear live on GitHub
6. Receive summary on your phone

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS + Framer Motion |
| State management | Zustand (with localStorage persistence) |
| Voice input | Web Speech API (browser-native, free) |
| Relay server | FastAPI + WebSockets |
| AI coding agent | Groq API (llama-3.3-70b-versatile) |
| Git automation | GitPython + subprocess |
| GitHub integration | PyGithub + Personal Access Token |
| Build tool | Vite |
| Package manager | npm |

---

## Project Structure

```
anywhere-coder/
├── relay/                      # FastAPI backend
│   ├── main.py                 # WebSocket relay + task router
│   ├── claude_runner.py        # LLM call + file writer
│   ├── git_helper.py           # git add, commit, push
│   ├── requirements.txt        # Python dependencies
│   ├── Procfile                # For deployment
│   └── run.sh                  # Local start script
├── src/
│   ├── components/
│   │   ├── DashboardView.tsx   # Main project + task dashboard
│   │   ├── MobileView.tsx      # Mobile voice interface
│   │   ├── MicButton.tsx       # Voice capture button
│   │   └── TaskCard.tsx        # Task status card
│   ├── pages/
│   │   ├── Home.tsx            # Landing page
│   │   ├── Onboarding.tsx      # 3-step setup wizard
│   │   └── Settings.tsx        # GitHub token + workspace config
│   ├── lib/
│   │   ├── store.ts            # Zustand store + WebSocket logic
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── mock-data.ts        # Demo seed data
│   └── index.css               # Global styles + CSS variables
├── workspace/                  # Git repo — Claude writes files here
├── .env                        # API keys (never committed)
└── .gitignore
```

---

## Prerequisites

- Node.js 18+
- Python 3.11+
- Git
- A [Groq API key](https://console.groq.com) (free)
- A GitHub Personal Access Token with `repo` scope
- Chrome or Edge browser (for Web Speech API)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/kru2710shna/anywhere-coder.git
cd anywhere-coder
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Set up the relay server

```bash
cd relay
python3 -m venv venv
source venv/bin/activate
pip install fastapi "uvicorn[standard]" anthropic python-dotenv PyGithub gitpython groq websockets
```

### 4. Create the workspace repo

Create a new empty repo on GitHub (e.g. `wfa-workspace`), then:

```bash
cd ..
git clone https://github.com/YOUR_USERNAME/wfa-workspace.git workspace
```

### 5. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
ANTHROPIC_API_KEY=your_groq_api_key_here
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_REPO=your_username/wfa-workspace
GITHUB_USERNAME=your_username
WORKSPACE_DIR=/absolute/path/to/anywhere-coder/workspace
```

> **GitHub Token:** Go to `github.com/settings/tokens` → Generate new token (classic) → check `repo` scope.

> **Groq API Key:** Go to `console.groq.com` → API Keys → Create new key (free tier available).

---

## Running the App

You need **two terminal windows** running simultaneously.

### Terminal 1 — Start the relay server

```bash
cd anywhere-coder/relay
source venv/bin/activate
python -m uvicorn main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Terminal 2 — Start the frontend

```bash
cd anywhere-coder
npm run dev
```

You should see:
```
VITE v5.x  ready in 200ms
➜  Local:   http://localhost:8080/
```

### Open the app

Go to `http://localhost:8080` in Chrome or Edge.

---

## First-time Setup (Onboarding)

When you first open the app, you'll be guided through 3 steps:

**Step 1 — Connect relay**
Make sure your relay server is running on port 8000. Click "Check connection".

**Step 2 — GitHub access**
Enter your GitHub username, repository name (`username/repo`), and Personal Access Token.

**Step 3 — Workspace path**
Enter the absolute path to your workspace folder (e.g. `/Users/yourname/anywhere-coder/workspace`).

Click "All set — launch app" and you're ready to build.

---

## Using the App

### Create a project
Click the `+` button → enter a project name → press Create.

### Speak a task
Go inside a project → tap the mic button → speak your task clearly.

**Example tasks:**
```
"Create a Hero section with a headline and CTA button using Tailwind CSS"
"Add a dark navbar with Home, About, and Contact links"
"Create a Footer component with social media links"
"Write a README for a React app called Work From Anywhere"
"Add a Button component with primary and secondary variants"
```

### Watch it work
- Status updates in real-time: Received → Processing → Coding → Done
- Files are written to your `workspace/` folder
- A git commit is pushed to your GitHub repo
- Summary appears in the task card
- Browser notification fires when complete

### View commits
Open your GitHub workspace repo to see all commits made by the agent.

---

## Architecture Deep Dive

### Relay Server (`relay/main.py`)
FastAPI server with two endpoints:
- `GET /health` — returns `{"status": "online"}`
- `POST /task` — receives task, spawns background process, returns session ID
- `WS /ws/{session_id}` — WebSocket for live status updates

### Coding Agent (`relay/claude_runner.py`)
Calls the LLM with a strict JSON system prompt. The model returns:
```json
{
  "summary": "Created a Navbar component with navigation links.",
  "whats_next": "Style the navbar and add mobile responsiveness.",
  "files_written": 1,
  "files": {
    "src/components/Navbar.tsx": "import React..."
  }
}
```
Files are extracted and written to disk at `WORKSPACE_DIR`.

### Git Helper (`relay/git_helper.py`)
After files are written:
```python
git add .
git commit -m "feat: <task summary>"
git push origin main
```
Returns the commit hash back to the relay, which broadcasts it to the frontend.

### Frontend Store (`src/lib/store.ts`)
Zustand store manages:
- Opening WebSocket connection to relay
- Dispatching `POST /task` after WebSocket is open
- Handling incoming status messages (`transcribing`, `coding`, `done`, `error`)
- Updating task state, commit hash, summary, and files written
- Firing browser notifications on completion

---

## Environment Variables Reference

| Variable | Description | Example |
|---|---|---|
| `ANTHROPIC_API_KEY` | Groq API key | `gsk_...` |
| `GITHUB_TOKEN` | GitHub PAT with repo scope | `ghp_...` |
| `GITHUB_REPO` | Target repo for commits | `username/wfa-workspace` |
| `GITHUB_USERNAME` | Your GitHub username | `kru2710shna` |
| `WORKSPACE_DIR` | Absolute path to workspace | `/Users/you/anywhere-coder/workspace` |

---

## Troubleshooting

**White screen / blank app**
```bash
# Clear localStorage and reload
# Open browser console (Cmd+Option+J) and run:
localStorage.clear(); location.reload();
```

**WebSocket connection failed**
```bash
# Make sure relay is running
curl http://localhost:8000/health
# Should return: {"status":"online"}

# If not running, start it:
cd relay && source venv/bin/activate && python -m uvicorn main:app --port 8000
```

**Git push failing**
```bash
# Test your token directly
cd relay
python3 -c "
import os, subprocess
from dotenv import load_dotenv
load_dotenv('../.env')
t = os.getenv('GITHUB_TOKEN')
u = os.getenv('GITHUB_USERNAME')
r = os.getenv('GITHUB_REPO')
result = subprocess.run(['git', 'ls-remote', f'https://{u}:{t}@github.com/{r}.git'], capture_output=True, text=True)
print('Auth:', 'OK' if result.returncode == 0 else result.stderr)
"
```

**Speech recognition not working**
- Use Chrome or Edge (Firefox does not support Web Speech API)
- Make sure microphone permissions are granted
- Speak clearly after tapping the mic button

**No module named uvicorn**
```bash
cd relay && source venv/bin/activate && pip install "uvicorn[standard]"
```

---

## Hackathon

Built for the **LevelNext Hackathon** — March 2026

> *Build innovative tech solutions that solve real-world problems and shape the future.*

**Themes:** AI/ML · Web · Productivity

**Prize pool:** $3,498

**Submission:** [levelnext-hackathon.devpost.com](https://levelnext-hackathon.devpost.com)

---

## What's Next

- Multi-file context awareness — agent reads existing codebase before writing
- Mobile PWA with offline support
- Support for any remote machine, not just localhost
- Multiple agents owning different parts of the stack
- Natural language code review and refactoring
- Voice-controlled git branching and PR creation

---

## Author

**Krushna Thakkar**
CMU ECE Graduate Student
[github.com/kru2710shna](https://github.com/kru2710shna)

---

## License

MIT License — feel free to build on this.

---

*The future of software development isn't a faster laptop. It's not needing one.*
