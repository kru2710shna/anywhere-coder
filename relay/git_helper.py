import os
import subprocess
from dotenv import load_dotenv

load_dotenv("../.env")

WORKSPACE_DIR = os.getenv("WORKSPACE_DIR", "../workspace")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO = os.getenv("GITHUB_REPO")
GITHUB_USERNAME = os.getenv("GITHUB_USERNAME")


def run(cmd: list, cwd: str) -> str:
    result = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        raise Exception(f"Git error: {result.stderr.strip()}")
    return result.stdout.strip()


def commit_and_push(files: dict, commit_message: str) -> dict:
    workspace = os.path.abspath(WORKSPACE_DIR)
    token = os.getenv("GITHUB_TOKEN")
    username = os.getenv("GITHUB_USERNAME")
    repo = os.getenv("GITHUB_REPO")
    remote_url = f"https://{username}:{token}@github.com/{repo}.git"

    if not os.path.exists(os.path.join(workspace, ".git")):
        run(["git", "init"], cwd=workspace)
        run(["git", "branch", "-M", "main"], cwd=workspace)
        run(["git", "remote", "add", "origin", remote_url], cwd=workspace)
    else:
        run(["git", "remote", "set-url", "origin", remote_url], cwd=workspace)

    run(["git", "config", "user.email", "wfa-agent@bot.com"], cwd=workspace)
    run(["git", "config", "user.name", "WFA Agent"], cwd=workspace)
    run(["git", "add", "."], cwd=workspace)

    status = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=workspace, capture_output=True, text=True
    )
    if not status.stdout.strip():
        return {"hash": "no-changes", "message": "Nothing new to commit"}

    run(["git", "commit", "-m", commit_message], cwd=workspace)
    run(["git", "push", "-u", "origin", "main"], cwd=workspace)

    commit_hash = run(["git", "rev-parse", "--short", "HEAD"], cwd=workspace)
    print(f"[git_helper] Pushed: {commit_hash} — {commit_message}")
    return {"hash": commit_hash, "message": commit_message}
