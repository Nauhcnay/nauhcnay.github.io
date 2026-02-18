from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from pathlib import Path

from ..models.schemas import GitCommit
from ..services.git_handler import GitHandler

router = APIRouter(prefix="/api/git", tags=["git"])

# 仓库根目录
REPO_ROOT = Path(__file__).parent.parent.parent.parent
git_handler = GitHandler(REPO_ROOT)


@router.get("/status")
async def get_status():
    """获取 Git 仓库状态"""
    try:
        status = git_handler.get_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/diff")
async def get_diff(cached: bool = False):
    """获取 diff 内容"""
    try:
        diff = git_handler.get_diff(cached=cached)
        return {"diff": diff}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/commits")
async def get_commits(limit: int = 10):
    """获取最近的提交记录"""
    try:
        commits = git_handler.get_recent_commits(limit=limit)
        return commits
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/commit")
async def commit_changes(git_commit: GitCommit):
    """提交更改"""
    try:
        commit_sha = git_handler.commit(git_commit.message)

        result = {
            "success": True,
            "commit": commit_sha[:7],
            "message": git_commit.message
        }

        # 如果需要推送
        if git_commit.push:
            push_result = git_handler.push()
            result["push"] = push_result

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/push")
async def push_changes(branch: str = None):
    """推送到远程仓库"""
    try:
        result = git_handler.push(branch=branch)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pull")
async def pull_changes(branch: str = None):
    """从远程仓库拉取"""
    try:
        result = git_handler.pull(branch=branch)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/auto-commit")
async def auto_commit(message: str = None, deploy: bool = False):
    """自动提交并推送，deploy=True 时合并到 main 并推送"""
    try:
        result = git_handler.auto_commit_and_push(message=message, deploy=deploy)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/restore/{file_path:path}")
async def restore_file(file_path: str, commit: str = "HEAD"):
    """恢复文件到指定版本"""
    try:
        git_handler.checkout_file(file_path, commit=commit)
        return {"success": True, "file": file_path, "commit": commit}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
