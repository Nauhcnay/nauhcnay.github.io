from fastapi import APIRouter, HTTPException, UploadFile, File, Body, Query
from typing import Dict, Any
from pathlib import Path
import shutil
from pydantic import BaseModel

from ..models.schemas import ProfileInfo
from ..services.yaml_handler import YAMLHandler
from ..services.markdown_handler import MarkdownHandler

router = APIRouter(prefix="/api/profile", tags=["profile"])

# 仓库根目录
REPO_ROOT = Path(__file__).parent.parent.parent.parent
yaml_handler = YAMLHandler(REPO_ROOT)
markdown_handler = MarkdownHandler(REPO_ROOT)


class ConfigUpdate(BaseModel):
    field: str
    value: Any


class ContentUpdate(BaseModel):
    content: str


@router.get("/")
async def get_profile():
    """获取个人信息"""
    try:
        config = yaml_handler.read_config()
        about = markdown_handler.read_about()

        # 提取研究兴趣
        research_section = markdown_handler.extract_section("Research Interests")

        return {
            "config": config,
            "about": about,
            "research_interests": research_section
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/config")
async def update_config(field: str = Query(...), value: str = Query(...)):
    """更新配置文件中的字段"""
    try:
        config = yaml_handler.update_config_field(field, value)
        return {"success": True, "config": config}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/about")
async def update_about(content: str = Body(..., embed=True)):
    """更新 About Me 内容"""
    try:
        markdown_handler.update_about(content)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/research-interests")
async def update_research_interests(content: str = Body(..., embed=True)):
    """更新研究兴趣"""
    try:
        markdown_handler.update_section("Research Interests", content)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-avatar")
async def upload_avatar(file: UploadFile = File(...)):
    """上传头像"""
    try:
        upload_dir = REPO_ROOT / "assets" / "img"
        upload_dir.mkdir(parents=True, exist_ok=True)

        # 保存为 avatar.png
        file_extension = Path(file.filename).suffix
        avatar_filename = f"avatar{file_extension}"
        file_path = upload_dir / avatar_filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 更新配置
        relative_path = f"./assets/img/{avatar_filename}"
        yaml_handler.update_config_field("avatar", relative_path)

        return {
            "success": True,
            "path": relative_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-cv")
async def upload_cv(file: UploadFile = File(...)):
    """上传简历 PDF"""
    try:
        upload_dir = REPO_ROOT / "assets" / "files"
        upload_dir.mkdir(parents=True, exist_ok=True)

        # 保存文件
        file_path = upload_dir / file.filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 更新配置
        relative_path = f"./assets/files/{file.filename}"
        yaml_handler.update_config_field("cv_link", relative_path)

        return {
            "success": True,
            "path": relative_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
