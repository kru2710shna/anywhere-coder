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

---

## Project Structure
```
anywhere-coder/
├── relay/
│   ├── main.py                 # WebSocket relay + task router
│   ├── claude_runner.py        # LLM call + file writer
│   ├── git_helper.py           # git add, commit, push
│   ├── requirements.txt
│   └── run.sh
├── src/
│   ├── components/
│   │   ├── DashboardView.tsx
│   │   ├── MobileView.tsx
│   │   ├── MicButton.tsx
│   │   └── TaskCard.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Onboarding.tsx
│   │   └── Settings.tsx
│   ├── lib/
│   │   ├── store.ts
│   │   ├── types.ts
│   │   └── mock-data.ts
│   └── index.css
├── workspace/                  # Claude writes files here
├── .env                        # Never committed
└── .env.example
```

---

## Prerequisites

- Node.js 18+
- Python 3.11+
- Git
- [Groq API key](https://console.groq.com) (free)
- GitHub Personal Access Token with `repo` scope
- Chrome or Edge (for Web Speech API)

---

## Installation

### 1. Clone the repo
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
pip install fastapi "uvicorn[standard]" python-dotenv PyGithub gitpython groq websockets
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

Edit `.env`:
```env
ANTHROPIC_API_KEY=your_groq_api_key_here
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_REPO=your_username/wfa-workspace
GITHUB_USERNAME=your_username
WORKSPACE_DIR=/absolute/path/to/anywhere-coder/workspace
```

---

## Running the App

Open **two terminal windows**.

### Terminal 1 — Relay server
```bash
cd anywhere-coder/relay
source venv/bin/activate
python -m uvicorn main:app --reload --port 8000
```

### Terminal 2 — Frontend
```bash
cd anywhere-coder
npm run dev
```

Open `http://localhost:8080` in Chrome or Edge.

---

## First-time Setup

On first launch, a 3-step onboarding wizard guides you through:

1. **Connect relay** — verifies your local server is running
2. **GitHub access** — enter username, repo, and Personal Access Token
3. **Workspace path** — absolute path to your workspace folder

---

## Using the App

### Create a project
Click `+` → enter project name → Create.

### Speak a task
Go inside a project → tap the mic → speak clearly.

**Example tasks:**
```
"Create a Hero section with a headline and CTA button"
"Add a dark navbar with Home, About, and Contact links"
"Create a Footer component with social media links"
"Add a Button component with primary and secondary variants"
```

### Watch it work
- Live status: Received → Processing → Coding → Done
- Files written to `workspace/`
- Git commit pushed to GitHub
- Summary card updates
- Browser notification fires

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `ANTHROPIC_API_KEY` | Groq API key | `gsk_...` |
| `GITHUB_TOKEN` | GitHub PAT with repo scope | `ghp_...` |
| `GITHUB_REPO` | Target repo | `username/wfa-workspace` |
| `GITHUB_USERNAME` | GitHub username | `kru2710shna` |
| `WORKSPACE_DIR` | Absolute workspace path | `/Users/you/anywhere-coder/workspace` |

---

## Troubleshooting

**Blank screen after onboarding**
```bash
# In browser console:
localStorage.clear(); location.reload();
```

**WebSocket connection failed**
```bash
curl http://localhost:8000/health
# Should return: {"status":"online"}
```

**Git push failing**
```bash
cd relay && source venv/bin/activate && python3 -c "
import os, subprocess
from dotenv import load_dotenv
load_dotenv('../.env')
t = os.getenv('GITHUB_TOKEN')
u = os.getenv('GITHUB_USERNAME')
r = os.getenv('GITHUB_REPO')
result = subprocess.run(['git','ls-remote',f'https://{u}:{t}@github.com/{r}.git'],capture_output=True,text=True)
print('Auth OK' if result.returncode == 0 else result.stderr)
"
```

**Speech not working**
- Use Chrome or Edge only
- Grant microphone permissions
- Speak clearly after tapping mic

---

## Hackathon

Built for the **LevelNext Hackathon** — March 2026

> *Build innovative tech solutions that solve real-world problems and shape the future.*

**Themes:** AI/ML · Web · Productivity  
**Prize pool:** $3,498  
**Submission:** [levelnext-hackathon.devpost.com](https://levelnext-hackathon.devpost.com)

---

## What's Next

- Multi-file context awareness
- Mobile PWA with offline support
- Support for any remote machine
- Multiple specialized agents
- Voice-controlled git branching and PR creation

---

## Author

**Krushna Thakkar** · CMU ECE Graduate Student  
[github.com/kru2710shna](https://github.com/kru2710shna)

---

## License

MIT — feel free to build on this.

---

*The future of software development isn't a faster laptop. It's not needing one.*
