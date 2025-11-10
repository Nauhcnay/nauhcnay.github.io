from typing import Optional, List
from pydantic import BaseModel, Field, HttpUrl


class Publication(BaseModel):
    """论文数据模型"""
    title: str = Field(..., description="论文标题")
    authors: str = Field(..., description="作者列表")
    conference_short: str = Field(..., description="会议简称（如 UIST 2024）")
    conference: str = Field(..., description="完整会议名称")
    pdf: Optional[str] = Field(None, description="PDF 链接")
    code: Optional[str] = Field(None, description="代码链接")
    page: Optional[str] = Field(None, description="项目页面链接")
    bibtex: Optional[str] = Field(None, description="BibTeX 文件路径")
    notes: Optional[str] = Field(None, description="备注（如 Oral, Best Paper）")
    image: Optional[str] = Field(None, description="缩略图路径")
    featured: bool = Field(False, description="是否为精选论文")
    order: int = Field(0, description="显示顺序（数字越小越靠前）")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "ShadowMagic: Human-Aware Mobile AR Occlusion",
                "authors": "Chuan Yan, Yicheng He, Voicu Popescu",
                "conference_short": "UIST 2024",
                "conference": "The ACM Symposium on User Interface Software and Technology",
                "pdf": "https://dl.acm.org/doi/10.1145/3654777.3676420",
                "code": "https://github.com/nauhcnay/ShadowMagic",
                "bibtex": "./assets/bib/ShadowMagic2024.bib",
                "image": "./assets/img/teaser_shadowmaigc2024.jpg",
                "featured": True,
                "order": 1
            }
        }


class NewsItem(BaseModel):
    """新闻动态数据模型"""
    date: str = Field(..., description="日期（格式：YYYY-MM 或 YYYY-MM-DD）")
    content: str = Field(..., description="新闻内容（支持 Markdown）")
    order: int = Field(0, description="显示顺序")

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2024-10",
                "content": "Our paper **ShadowMagic** has been accepted to UIST 2024!",
                "order": 1
            }
        }


class ProfileInfo(BaseModel):
    """个人信息数据模型"""
    title: str = Field(..., description="姓名")
    position: str = Field(..., description="职位")
    affiliation: str = Field(..., description="机构")
    affiliation_link: Optional[str] = Field(None, description="机构链接")
    affiliation_logo: Optional[str] = Field(None, description="机构 Logo")
    email: Optional[str] = Field(None, description="邮箱")
    avatar: Optional[str] = Field(None, description="头像路径")
    cv_link: Optional[str] = Field(None, description="简历链接")

    # 社交链接
    google_scholar: Optional[str] = Field(None, description="Google Scholar 链接")
    github_link: Optional[str] = Field(None, description="GitHub 链接")
    linkedin: Optional[str] = Field(None, description="LinkedIn 链接")
    twitter: Optional[str] = Field(None, description="Twitter 链接")

    # 个人简介
    description: Optional[str] = Field(None, description="About Me 内容（Markdown）")
    research_interests: Optional[List[str]] = Field(None, description="研究兴趣列表")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Chuan Yan",
                "position": "Ph.D. Student",
                "affiliation": "George Mason University",
                "email": "cyanag@gmu.edu",
                "google_scholar": "https://scholar.google.com/citations?user=example",
                "github_link": "https://github.com/nauhcnay",
                "research_interests": [
                    "Augmented Reality",
                    "Computer Graphics",
                    "Human-Computer Interaction"
                ]
            }
        }


class GitCommit(BaseModel):
    """Git 提交数据模型"""
    message: str = Field(..., description="提交信息")
    push: bool = Field(False, description="是否推送到远程仓库")


class ScholarQuery(BaseModel):
    """Google Scholar 查询模型"""
    url: str = Field(..., description="Google Scholar 论文页面 URL")
