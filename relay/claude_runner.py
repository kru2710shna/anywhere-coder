import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv("../.env")

client = Groq(api_key=os.getenv("ANTHROPIC_API_KEY"))
WORKSPACE_DIR = os.getenv("WORKSPACE_DIR", "../workspace")

SYSTEM_PROMPT = """You are an expert coding agent writing code for a real project.

The user gives you a task in plain English. You write the actual code files needed.

Respond ONLY with a valid JSON object. No markdown. No backticks. No explanation.

Format:
{
  "summary": "One sentence: what you did.",
  "whats_next": "One sentence: what should be done next.",
  "files_written": 1,
  "files": {
    "src/components/Example.tsx": "import React from 'react';\\n\\nexport default function Example() {\\n  return <div>Hello</div>;\\n}"
  }
}

CRITICAL:
- Return ONLY the JSON object, nothing else before or after
- No backticks, no markdown fences, no code blocks
- All file content must be a single JSON string value
- Use \\n for newlines inside file content strings
- Use \\" for double quotes inside file content strings
- files_written must equal the exact number of keys in files
"""


def clean_json(raw: str) -> str:
    raw = re.sub(r"```json\s*", "", raw)
    raw = re.sub(r"```\s*", "", raw)
    raw = raw.strip()
    start = raw.find("{")
    end = raw.rfind("}")
    if start != -1 and end != -1:
        raw = raw[start : end + 1]
    return raw


def run_claude_task(task: str) -> dict:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=4096,
        temperature=0.1,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Task: {task}\n\n"
                    "Remember: respond with a single JSON object only. "
                    "Escape all newlines as \\n inside string values."
                ),
            },
        ],
    )

    raw = response.choices[0].message.content.strip()
    print(f"[claude_runner] Response length: {len(raw)} chars")

    cleaned = clean_json(raw)

    try:
        result = json.loads(cleaned)
    except json.JSONDecodeError as e:
        print(f"[claude_runner] JSON error: {e}")
        print(f"[claude_runner] Cleaned (first 600):\n{cleaned[:600]}")
        raise Exception(f"Failed to parse AI response: {e}")

    for relative_path, content in result.get("files", {}).items():
        full_path = os.path.join(WORKSPACE_DIR, relative_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"[claude_runner] Wrote: {full_path}")

    return result