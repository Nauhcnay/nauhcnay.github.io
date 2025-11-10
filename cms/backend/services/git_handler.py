import git
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime


class GitHandler:
    """处理 Git 操作"""

    def __init__(self, repo_root: Path):
        self.repo_root = repo_root
        try:
            self.repo = git.Repo(repo_root)
        except git.exc.InvalidGitRepositoryError:
            raise ValueError(f"{repo_root} 不是一个有效的 Git 仓库")

    def get_status(self) -> Dict[str, Any]:
        """获取仓库状态"""
        return {
            "branch": self.repo.active_branch.name,
            "is_dirty": self.repo.is_dirty(),
            "untracked_files": self.repo.untracked_files,
            "modified_files": [item.a_path for item in self.repo.index.diff(None)],
            "staged_files": [item.a_path for item in self.repo.index.diff("HEAD")],
        }

    def get_diff(self, cached: bool = False) -> str:
        """获取 diff 内容"""
        if cached:
            # 获取暂存区的 diff
            return self.repo.git.diff("--cached")
        else:
            # 获取工作区的 diff
            return self.repo.git.diff()

    def commit(self, message: str, files: List[str] = None) -> str:
        """提交更改"""
        if files:
            # 只添加指定的文件
            self.repo.index.add(files)
        else:
            # 添加所有更改的文件
            self.repo.git.add(A=True)

        # 提交
        commit = self.repo.index.commit(message)
        return commit.hexsha

    def push(self, branch: str = None) -> Dict[str, Any]:
        """推送到远程仓库"""
        try:
            if branch is None:
                branch = self.repo.active_branch.name

            # 推送
            origin = self.repo.remote("origin")
            push_info = origin.push(branch)

            return {
                "success": True,
                "branch": branch,
                "info": str(push_info[0].summary) if push_info else "Push completed"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def pull(self, branch: str = None) -> Dict[str, Any]:
        """从远程仓库拉取"""
        try:
            if branch is None:
                branch = self.repo.active_branch.name

            origin = self.repo.remote("origin")
            pull_info = origin.pull(branch)

            return {
                "success": True,
                "branch": branch,
                "info": str(pull_info[0]) if pull_info else "Pull completed"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def get_recent_commits(self, limit: int = 10) -> List[Dict[str, Any]]:
        """获取最近的提交记录"""
        commits = []
        for commit in list(self.repo.iter_commits())[:limit]:
            commits.append({
                "sha": commit.hexsha[:7],
                "message": commit.message.strip(),
                "author": str(commit.author),
                "date": datetime.fromtimestamp(commit.committed_date).isoformat(),
            })
        return commits

    def checkout_file(self, file_path: str, commit: str = "HEAD") -> None:
        """恢复文件到指定版本"""
        self.repo.git.checkout(commit, file_path)

    def create_branch(self, branch_name: str) -> Dict[str, Any]:
        """创建新分支"""
        try:
            new_branch = self.repo.create_head(branch_name)
            return {
                "success": True,
                "branch": branch_name
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def switch_branch(self, branch_name: str) -> Dict[str, Any]:
        """切换分支"""
        try:
            self.repo.git.checkout(branch_name)
            return {
                "success": True,
                "branch": branch_name
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def auto_commit_and_push(self, message: str = None) -> Dict[str, Any]:
        """自动提交并推送（便捷方法）"""
        if not self.repo.is_dirty() and not self.repo.untracked_files:
            return {
                "success": False,
                "error": "没有需要提交的更改"
            }

        # 生成默认提交信息
        if not message:
            status = self.get_status()
            modified = len(status["modified_files"])
            untracked = len(status["untracked_files"])
            message = f"Update content via CMS ({modified} modified, {untracked} new)"

        try:
            # 提交
            commit_sha = self.commit(message)

            # 推送
            push_result = self.push()

            return {
                "success": True,
                "commit": commit_sha[:7],
                "message": message,
                "push": push_result
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
