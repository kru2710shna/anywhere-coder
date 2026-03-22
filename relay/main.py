import os
import uuid
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from claude_runner import run_claude_task

load_dotenv("../.env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store: session_id -> status/summary
tasks: dict = {}

# Active WebSocket connections: session_id -> websocket
connections: dict = {}


class TaskRequest(BaseModel):
    task: str
    project_id: str
    session_id: str | None = None


@app.get("/health")
def health():
    return {"status": "online"}


@app.post("/task")
async def create_task(req: TaskRequest):
    session_id = req.session_id or str(uuid.uuid4())
    tasks[session_id] = {"status": "received", "summary": None, "whats_next": None}

    # Run in background so we return immediately
    asyncio.create_task(process_task(session_id, req.task, req.project_id))

    return {"session_id": session_id, "status": "received"}


async def process_task(session_id: str, task: str, project_id: str):
    await broadcast(session_id, {"status": "transcribing", "message": "Processing task..."})
    await asyncio.sleep(0.5)

    await broadcast(session_id, {"status": "coding", "message": f"Asking Claude to: {task}"})

    try:
        result = await asyncio.to_thread(run_claude_task, task)
        tasks[session_id] = {
            "status": "done",
            "summary": result["summary"],
            "whats_next": result["whats_next"],
            "files_written": result["files_written"],
        }
        await broadcast(session_id, {
            "status": "done",
            "summary": result["summary"],
            "whats_next": result["whats_next"],
            "files_written": result["files_written"],
            "message": f"Done — {result['files_written']} file(s) written",
        })
    except Exception as e:
        tasks[session_id] = {"status": "error", "message": str(e)}
        await broadcast(session_id, {"status": "error", "message": str(e)})


async def broadcast(session_id: str, data: dict):
    ws = connections.get(session_id)
    if ws:
        try:
            await ws.send_json(data)
        except Exception:
            pass


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    connections[session_id] = websocket
    try:
        # Send current status immediately on connect
        if session_id in tasks:
            await websocket.send_json(tasks[session_id])
        while True:
            await websocket.receive_text()  # keep alive
    except WebSocketDisconnect:
        connections.pop(session_id, None)
