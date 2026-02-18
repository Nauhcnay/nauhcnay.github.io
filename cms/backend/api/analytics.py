import subprocess
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

REPO_ROOT = Path(__file__).parent.parent.parent.parent


def _get_repo_slug() -> str:
    """从 git remote 获取 owner/repo"""
    result = subprocess.run(
        ["git", "remote", "get-url", "origin"],
        capture_output=True, text=True, cwd=REPO_ROOT,
    )
    url = result.stdout.strip()
    # 支持 https://github.com/owner/repo.git 和 git@github.com:owner/repo.git
    if "github.com/" in url:
        slug = url.split("github.com/")[1]
    elif "github.com:" in url:
        slug = url.split("github.com:")[1]
    else:
        raise ValueError(f"Cannot parse GitHub repo from: {url}")
    return slug.removesuffix(".git")


def _gh_api(endpoint: str) -> dict:
    """调用 gh api 并返回 JSON"""
    result = subprocess.run(
        ["gh", "api", endpoint],
        capture_output=True, text=True, cwd=REPO_ROOT,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.strip() or f"gh api failed: {endpoint}")
    return json.loads(result.stdout)


@router.get("/traffic")
async def get_traffic():
    """获取 GitHub 仓库的流量数据（最近 14 天）"""
    try:
        slug = _get_repo_slug()

        views = _gh_api(f"repos/{slug}/traffic/views")
        clones = _gh_api(f"repos/{slug}/traffic/clones")
        referrers = _gh_api(f"repos/{slug}/traffic/popular/referrers")
        paths = _gh_api(f"repos/{slug}/traffic/popular/paths")

        return {
            "views": views,
            "clones": clones,
            "referrers": referrers,
            "popular_paths": paths,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
