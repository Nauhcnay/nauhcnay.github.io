import re
from pathlib import Path
from typing import List, Dict, Any, Optional
import shutil
from datetime import datetime


class MarkdownHandler:
    """处理 Markdown 文件的读写操作"""

    def __init__(self, repo_root: Path):
        self.repo_root = repo_root
        self.index_file = repo_root / "index.md"

    def read_index(self) -> str:
        """读取主页 Markdown 内容"""
        if not self.index_file.exists():
            return ""

        with open(self.index_file, "r", encoding="utf-8") as f:
            return f.read()

    def write_index(self, content: str) -> None:
        """写入主页 Markdown 内容"""
        # 创建备份
        self._create_backup(self.index_file)

        with open(self.index_file, "w", encoding="utf-8") as f:
            f.write(content)

    def extract_section(self, section_name: str) -> Optional[str]:
        """提取指定章节的内容"""
        content = self.read_index()

        # 匹配章节标题（支持 # 或 ## 开头）
        # 注意: rf-string 中 {1,2} 会被 f-string 解析，必须写成 {{1,2}}
        pattern = rf"^#{{1,2}}\s+{re.escape(section_name)}.*?$\n(.*?)(?=^#{{1,2}}\s+|\Z)"
        match = re.search(pattern, content, re.MULTILINE | re.DOTALL)

        if match:
            return match.group(1).strip()
        return None

    def update_section(self, section_name: str, new_content: str) -> str:
        """更新指定章节的内容"""
        content = self.read_index()

        # 匹配章节标题
        pattern = rf"(^#{{1,2}}\s+{re.escape(section_name)}.*?$\n)(.*?)(?=^#{{1,2}}\s+|\Z)"

        def replace_func(match):
            return match.group(1) + new_content.strip() + "\n\n"

        new_content_full = re.sub(
            pattern,
            replace_func,
            content,
            flags=re.MULTILINE | re.DOTALL
        )

        self.write_index(new_content_full)
        return new_content_full

    def read_news(self) -> List[Dict[str, str]]:
        """读取新闻列表"""
        news_section = self.extract_section("News")
        if not news_section:
            return []

        news_items = []
        # 匹配格式：- **[日期]** 内容
        pattern = r"-\s+\*\*\[([^\]]+)\]\*\*\s+(.+)"

        for match in re.finditer(pattern, news_section):
            news_items.append({
                "date": match.group(1),
                "content": match.group(2).strip()
            })

        return news_items

    def write_news(self, news_items: List[Dict[str, str]]) -> None:
        """写入新闻列表"""
        # 生成新闻内容
        news_content = "\n".join([
            f"- **[{item['date']}]** {item['content']}"
            for item in news_items
        ])

        self.update_section("News", news_content)

    def add_news_item(self, date: str, content: str) -> List[Dict[str, str]]:
        """添加新闻条目"""
        news_items = self.read_news()
        news_items.insert(0, {"date": date, "content": content})
        self.write_news(news_items)
        return news_items

    def delete_news_item(self, index: int) -> List[Dict[str, str]]:
        """删除新闻条目"""
        news_items = self.read_news()
        if 0 <= index < len(news_items):
            news_items.pop(index)
            self.write_news(news_items)
        return news_items

    def update_news_item(self, index: int, date: str, content: str) -> List[Dict[str, str]]:
        """更新新闻条目"""
        news_items = self.read_news()
        if 0 <= index < len(news_items):
            news_items[index] = {"date": date, "content": content}
            self.write_news(news_items)
        return news_items

    def read_about(self) -> Optional[str]:
        """读取 About Me 章节"""
        # 提取 ## About Me 章节的内容
        return self.extract_section("About Me")

    def update_about(self, new_content: str) -> None:
        """更新 About Me 章节"""
        self.update_section("About Me", new_content)

    def _create_backup(self, file_path: Path) -> None:
        """创建文件备份"""
        if not file_path.exists():
            return

        backup_dir = self.repo_root / ".cms_backups"
        backup_dir.mkdir(exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"{file_path.stem}_{timestamp}{file_path.suffix}"
        backup_path = backup_dir / backup_name

        shutil.copy2(file_path, backup_path)

        # 只保留最近 10 个备份
        backups = sorted(backup_dir.glob(f"{file_path.stem}_*{file_path.suffix}"))
        if len(backups) > 10:
            for old_backup in backups[:-10]:
                old_backup.unlink()
