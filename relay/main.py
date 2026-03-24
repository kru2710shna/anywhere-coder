import os
import uuid
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from claude_runner import run_claude_task
from git_helper import commit_and_push

load_dotenv("../.env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store
tasks: dict = {}
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
    tasks[session_id] = {"status": "received", "summary": None}
    asyncio.create_task(process_task(session_id, req.task, req.project_id))
    return {"session_id": session_id, "status": "received"}


async def process_task(session_id: str, task: str, project_id: str):
    await broadcast(session_id, {
        "status": "transcribing",
        "message": "Processing your request..."
    })
    await asyncio.sleep(0.4)

    await broadcast(session_id, {
        "status": "coding",
        "message": f"Claude is working on: {task}"
    })

    try:
        result = await asyncio.to_thread(run_claude_task, task)

        commit_msg = f"feat: {task[:60].lower()}"
        git_result = await asyncio.to_thread(commit_and_push, result["files"], commit_msg)

        final = {
            "status": "done",
            "summary": result["summary"],
            "whats_next": result["whats_next"],
            "files_written": result["files_written"],
            "commit_hash": git_result.get("hash", ""),
            "commit_message": commit_msg,
            "message": f"Done — {result['files_written']} file(s) committed to GitHub",
        }
        tasks[session_id] = final
        await broadcast(session_id, final)

    except Exception as e:
        err = {"status": "error", "message": str(e)}
        tasks[session_id] = err
        await broadcast(session_id, err)


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
        if session_id in tasks:
            await websocket.send_json(tasks[session_id])
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connections.pop(session_id, None)