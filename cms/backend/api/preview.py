"""Jekyll 预览服务：启动/停止/查询 Jekyll serve 子进程 + 反向代理"""

import os
import signal
import socket
import subprocess
import threading
import time
from pathlib import Path

import httpx
from fastapi import APIRouter, Request
from fastapi.responses import Response

router = APIRouter(tags=["preview"])

REPO_ROOT = Path(__file__).parent.parent.parent.parent
JEKYLL_PORT = 4000
JEKYLL_ORIGIN = f"http://127.0.0.1:{JEKYLL_PORT}"

_jekyll_lock = threading.Lock()
_http_client = httpx.AsyncClient(timeout=10, follow_redirects=True)


def _port_in_use() -> bool:
    try:
        with socket.create_connection(("127.0.0.1", JEKYLL_PORT), timeout=1):
            return True
    except (ConnectionRefusedError, OSError):
        return False


def _find_jekyll_pids() -> list[int]:
    try:
        out = subprocess.check_output(
            ["pgrep", "-f", f"jekyll serve.*--port {JEKYLL_PORT}"],
            text=True,
        )
        return [int(pid) for pid in out.strip().split("\n") if pid.strip()]
    except subprocess.CalledProcessError:
        return []


def _kill_jekyll():
    pids = _find_jekyll_pids()
    for pid in pids:
        try:
            os.kill(pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
    for _ in range(10):
        if not _find_jekyll_pids():
            return
        time.sleep(0.5)
    for pid in _find_jekyll_pids():
        try:
            os.kill(pid, signal.SIGKILL)
        except ProcessLookupError:
            pass


# ── API 端点 ────────────────────────────────────────────────────

@router.get("/api/preview/status")
async def preview_status():
    running = _port_in_use()
    return {
        "running": running,
        "url": "/preview/" if running else None,
    }


@router.post("/api/preview/start")
async def preview_start():
    with _jekyll_lock:
        if _port_in_use():
            return {
                "success": True,
                "message": "Jekyll 预览已在运行中",
                "url": "/preview/",
            }
        try:
            subprocess.Popen(
                [
                    "bundle", "exec", "jekyll", "serve",
                    "--host", "0.0.0.0",
                    "--port", str(JEKYLL_PORT),
                    "--watch",
                    "--force_polling",
                ],
                cwd=str(REPO_ROOT),
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
            return {
                "success": True,
                "message": "Jekyll 预览已启动，首次构建需要几秒钟",
                "url": "/preview/",
            }
        except FileNotFoundError:
            return {
                "success": False,
                "message": "未找到 bundle 命令，请确保已安装 Jekyll 和 Bundler",
                "url": None,
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"启动失败: {e}",
                "url": None,
            }


@router.post("/api/preview/stop")
async def preview_stop():
    with _jekyll_lock:
        if not _port_in_use() and not _find_jekyll_pids():
            return {"success": True, "message": "Jekyll 预览未在运行"}
        _kill_jekyll()
        return {"success": True, "message": "Jekyll 预览已停止"}


@router.post("/api/preview/rebuild")
async def preview_rebuild():
    await preview_stop()
    return await preview_start()


# ── 反向代理：/preview/{path} → Jekyll localhost:4000/{path} ───

@router.get("/preview/{path:path}")
@router.get("/preview/")
async def proxy_preview(request: Request, path: str = ""):
    """将请求代理到 Jekyll serve"""
    if not _port_in_use():
        return Response(
            content="<h2>Jekyll 预览未启动</h2><p>请先在 CMS 中点击「预览」按钮启动。</p>",
            media_type="text/html",
            status_code=503,
        )

    target_url = f"{JEKYLL_ORIGIN}/{path}"
    if request.url.query:
        target_url += f"?{request.url.query}"

    try:
        resp = await _http_client.get(target_url)
    except httpx.ConnectError:
        return Response(
            content="<h2>Jekyll 正在构建中，请稍后刷新...</h2>",
            media_type="text/html",
            status_code=502,
        )

    content = resp.content
    content_type = resp.headers.get("content-type", "")

    # 对 HTML 页面注入 <base> 标签，使相对路径资源也走 /preview/
    if "text/html" in content_type:
        content = content.replace(
            b"<head>",
            b'<head><base href="/preview/">',
            1,
        )

    return Response(
        content=content,
        status_code=resp.status_code,
        media_type=content_type,
    )
