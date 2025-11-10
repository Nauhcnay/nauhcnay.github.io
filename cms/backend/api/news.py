from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pathlib import Path

from ..models.schemas import NewsItem
from ..services.markdown_handler import MarkdownHandler

router = APIRouter(prefix="/api/news", tags=["news"])

# 仓库根目录
REPO_ROOT = Path(__file__).parent.parent.parent.parent
markdown_handler = MarkdownHandler(REPO_ROOT)


@router.get("/", response_model=List[Dict[str, str]])
async def get_news():
    """获取所有新闻动态"""
    try:
        news_items = markdown_handler.read_news()
        return news_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=List[Dict[str, str]])
async def add_news(news: NewsItem):
    """添加新闻动态"""
    try:
        news_items = markdown_handler.add_news_item(news.date, news.content)
        return news_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{index}", response_model=List[Dict[str, str]])
async def update_news(index: int, news: NewsItem):
    """更新新闻动态"""
    try:
        news_items = markdown_handler.update_news_item(index, news.date, news.content)
        return news_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{index}", response_model=List[Dict[str, str]])
async def delete_news(index: int):
    """删除新闻动态"""
    try:
        news_items = markdown_handler.delete_news_item(index)
        return news_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
