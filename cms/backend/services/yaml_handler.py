import yaml
from pathlib import Path
from typing import List, Dict, Any
import shutil
from datetime import datetime


class YAMLHandler:
    """处理 YAML 文件的读写操作"""

    def __init__(self, repo_root: Path):
        self.repo_root = repo_root
        self.publications_file = repo_root / "_data" / "publications.yml"
        self.config_file = repo_root / "_config.yml"

    def read_publications(self) -> List[Dict[str, Any]]:
        """读取论文列表"""
        if not self.publications_file.exists():
            return []

        with open(self.publications_file, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)

            # 处理不同的 YAML 格式
            if data is None:
                return []

            # 如果有 'main' 顶层键，提取其中的列表
            if isinstance(data, dict) and 'main' in data:
                publications = data['main']
                return publications if isinstance(publications, list) else []

            # 直接返回列表
            if isinstance(data, list):
                return data

            return []

    def write_publications(self, publications: List[Dict[str, Any]]) -> None:
        """写入论文列表"""
        # 创建备份
        self._create_backup(self.publications_file)

        # 检查原文件格式，保持一致
        use_main_key = False
        if self.publications_file.exists():
            with open(self.publications_file, "r", encoding="utf-8") as f:
                original_data = yaml.safe_load(f)
                if isinstance(original_data, dict) and 'main' in original_data:
                    use_main_key = True

        # 写入新数据，保持原格式
        data_to_write = {'main': publications} if use_main_key else publications

        with open(self.publications_file, "w", encoding="utf-8") as f:
            yaml.dump(
                data_to_write,
                f,
                allow_unicode=True,
                default_flow_style=False,
                sort_keys=False,
                indent=2
            )

    def add_publication(self, publication: Dict[str, Any]) -> List[Dict[str, Any]]:
        """添加新论文"""
        publications = self.read_publications()
        publications.insert(0, publication)
        self.write_publications(publications)
        return publications

    def update_publication(self, index: int, publication: Dict[str, Any]) -> List[Dict[str, Any]]:
        """更新论文"""
        publications = self.read_publications()
        if 0 <= index < len(publications):
            publications[index] = publication
            self.write_publications(publications)
        return publications

    def delete_publication(self, index: int) -> List[Dict[str, Any]]:
        """删除论文"""
        publications = self.read_publications()
        if 0 <= index < len(publications):
            publications.pop(index)
            self.write_publications(publications)
        return publications

    def reorder_publications(self, indices: List[int]) -> List[Dict[str, Any]]:
        """重新排序论文"""
        publications = self.read_publications()
        reordered = [publications[i] for i in indices if 0 <= i < len(publications)]
        self.write_publications(reordered)
        return reordered

    def read_config(self) -> Dict[str, Any]:
        """读取 Jekyll 配置文件"""
        if not self.config_file.exists():
            return {}

        with open(self.config_file, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)

    def write_config(self, config: Dict[str, Any]) -> None:
        """写入 Jekyll 配置文件"""
        # 创建备份
        self._create_backup(self.config_file)

        # 写入新数据
        with open(self.config_file, "w", encoding="utf-8") as f:
            yaml.dump(
                config,
                f,
                allow_unicode=True,
                default_flow_style=False,
                sort_keys=False,
                indent=2
            )

    def update_config_field(self, field: str, value: Any) -> Dict[str, Any]:
        """更新配置文件中的单个字段"""
        config = self.read_config()
        config[field] = value
        self.write_config(config)
        return config

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
