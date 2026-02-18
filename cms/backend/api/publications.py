from fastapi import APIRouter, HTTPException, UploadFile, File
from typing import List, Dict, Any
from pathlib import Path
import shutil
from datetime import datetime

from ..models.schemas import Publication, ImportRequest
from ..services.yaml_handler import YAMLHandler
from ..services.publication_parser import parse_bibtex, parse_paper_url, parse_scholar_url

router = APIRouter(prefix="/api/publications", tags=["publications"])

# 仓库根目录
REPO_ROOT = Path(__file__).parent.parent.parent.parent
yaml_handler = YAMLHandler(REPO_ROOT)


@router.get("/", response_model=List[Dict[str, Any]])
async def get_publications():
    """获取所有论文列表"""
    try:
        publications = yaml_handler.read_publications()
        return publications
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=List[Dict[str, Any]])
async def add_publication(publication: Publication):
    """添加新论文"""
    try:
        # 转换为字典，移除 None 值
        pub_dict = {k: v for k, v in publication.dict().items() if v is not None}
        publications = yaml_handler.add_publication(pub_dict)
        return publications
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{index}", response_model=List[Dict[str, Any]])
async def update_publication(index: int, publication: Publication):
    """更新论文"""
    try:
        pub_dict = {k: v for k, v in publication.dict().items() if v is not None}
        publications = yaml_handler.update_publication(index, pub_dict)
        return publications
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{index}", response_model=List[Dict[str, Any]])
async def delete_publication(index: int):
    """删除论文"""
    try:
        publications = yaml_handler.delete_publication(index)
        return publications
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/reorder", response_model=List[Dict[str, Any]])
async def reorder_publications(indices: List[int]):
    """重新排序论文"""
    try:
        publications = yaml_handler.reorder_publications(indices)
        return publications
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/import")
async def import_publication(req: ImportRequest):
    """从 BibTeX / URL / Google Scholar 导入论文信息"""
    parsers = {
        "bibtex": parse_bibtex,
        "url": parse_paper_url,
        "scholar": parse_scholar_url,
    }
    parser = parsers.get(req.method)
    if not parser:
        return {"success": False, "data": None, "error": f"不支持的导入方式: {req.method}"}
    try:
        data = parser(req.input)
        return {"success": True, "data": data, "error": None}
    except ValueError as e:
        return {"success": False, "data": None, "error": str(e)}
    except Exception as e:
        return {"success": False, "data": None, "error": f"解析失败: {e}"}


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """上传论文缩略图"""
    try:
        # 确保上传目录存在
        upload_dir = REPO_ROOT / "assets" / "img"
        upload_dir.mkdir(parents=True, exist_ok=True)

        # 生成文件名（使用时间戳避免冲突）
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = Path(file.filename).suffix
        new_filename = f"publication_{timestamp}{file_extension}"
        file_path = upload_dir / new_filename

        # 保存文件
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 返回相对路径
        relative_path = f"./assets/img/{new_filename}"
        return {
            "success": True,
            "path": relative_path,
            "filename": new_filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload-bibtex")
async def upload_bibtex(file: UploadFile = File(...)):
    """上传 BibTeX 文件"""
    try:
        # 确保上传目录存在
        upload_dir = REPO_ROOT / "assets" / "bib"
        upload_dir.mkdir(parents=True, exist_ok=True)

        # 保存文件（使用原始文件名）
        file_path = upload_dir / file.filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 返回相对路径
        relative_path = f"./assets/bib/{file.filename}"
        return {
            "success": True,
            "path": relative_path,
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
