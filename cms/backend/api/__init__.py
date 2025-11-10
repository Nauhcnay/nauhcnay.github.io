from .publications import router as publications_router
from .news import router as news_router
from .profile import router as profile_router
from .git_api import router as git_router

__all__ = ["publications_router", "news_router", "profile_router", "git_router"]
