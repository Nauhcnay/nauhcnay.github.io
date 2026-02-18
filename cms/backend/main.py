from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from .api import publications_router, news_router, profile_router, git_router, preview_router, analytics_router

# 创建 FastAPI 应用
app = FastAPI(
    title="Personal Homepage CMS",
    description="内容管理系统 for Jekyll 个人主页",
    version="1.0.0"
)

# 配置 CORS（允许前端访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应该限制具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(publications_router)
app.include_router(news_router)
app.include_router(profile_router)
app.include_router(git_router)
app.include_router(preview_router)
app.include_router(analytics_router)

# 挂载 assets 目录（论文图片、PDF 等静态资源）
REPO_ROOT = Path(__file__).parent.parent.parent
ASSETS_DIR = REPO_ROOT / "assets"
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

# 挂载静态文件（前端界面）
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")


@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "message": "CMS is running"}


if __name__ == "__main__":
    import uvicorn
    import os

    # 获取仓库根目录
    repo_root = Path(__file__).parent.parent.parent
    cms_dir = Path(__file__).parent.parent

    uvicorn.run(
        "cms.backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(cms_dir)],  # 监控 cms 目录
        reload_includes=["*.py", "*.html", "*.css", "*.js", "*.yml", "*.yaml", "*.md"],  # 监控这些文件类型
        log_level="info"
    )
