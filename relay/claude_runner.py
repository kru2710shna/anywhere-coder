import os
import json
import anthropic
from dotenv import load_dotenv

load_dotenv("../.env")

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM_PROMPT = """You are an expert coding agent. The user will give you a task in plain English.

You must respond ONLY with valid JSON — no markdown, no explanation, no code fences.

Format:
{
  "summary": "One sentence: what you did.",
  "whats_next": "One sentence: what should be done next.",
  "files_written": 2,
  "files": {
    "relative/path/filename.ext": "full file content here"
  }
}

Rules:
- Always return valid JSON
- files_written = number of keys in files
- Keep file content clean and production-ready
- Use React + TypeScript + Tailwind when writing frontend code
"""


def run_claude_task(task: str) -> dict:
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[
            {"role": "user", "content": f"Task: {task}"}
        ],
    )

    raw = message.content[0].text.strip()

    # Strip markdown fences if Claude adds them anyway
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    result = json.loads(raw)
    return result
