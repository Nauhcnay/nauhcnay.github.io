# Personal Homepage CMS

一个用于管理 Jekyll 个人主页的本地内容管理系统（CMS）。

## 功能特性

- ✅ **论文管理**：添加、编辑、删除论文，支持上传缩略图和 BibTeX
- ✅ **新闻动态**：管理主页的新闻和更新
- ✅ **个人信息**：编辑个人资料、社交链接等
- ✅ **Git 集成**：可视化查看更改、提交和推送到 GitHub
- ✅ **自动备份**：每次修改前自动创建备份
- ✅ **实时预览**：所见即所得的编辑体验

## 技术栈

- **后端**：FastAPI（Python）
- **前端**：原生 JavaScript + Tailwind CSS
- **数据格式**：YAML + Markdown

## 快速开始

### 1. 安装依赖

```bash
cd cms
pip install -r requirements.txt
```

### 2. 启动 CMS

```bash
# 方法 1: 使用 Python 模块运行
cd /path/to/nauhcnay.github.io
python -m cms.backend.main

# 方法 2: 使用 uvicorn 运行
cd /path/to/nauhcnay.github.io/cms
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. 访问界面

打开浏览器访问：**http://localhost:8000**

## 使用指南

### 论文管理

1. 点击"论文管理" Tab
2. 点击"添加论文"按钮
3. 填写论文信息：
   - **必填**：标题、作者、会议简称、完整会议名
   - **可选**：PDF 链接、代码链接、项目页面、备注
   - 上传缩略图和 BibTeX 文件
   - 勾选"Featured"标记为精选论文
4. 点击"保存"

**编辑和删除**：
- 点击论文卡片右侧的编辑按钮修改信息
- 点击删除按钮移除论文

### 新闻动态管理

1. 点击"新闻动态" Tab
2. 点击"添加新闻"按钮
3. 填写日期和内容（支持 Markdown 格式）
4. 点击"保存"

**示例内容**：
```
**[2024-10]** Our paper **ShadowMagic** has been accepted to UIST 2024!
```

### 个人信息管理

1. 点击"个人信息" Tab
2. 编辑以下内容：
   - 基本信息（姓名、职位、机构、邮箱）
   - 社交链接（Google Scholar、GitHub、LinkedIn）
   - About Me（个人简介）
   - Research Interests（研究兴趣）
3. 点击"保存个人信息"

### Git 管理

CMS 提供两种提交方式：

**方式 1：快速同步（推荐）**
- 点击右上角的"提交并推送"按钮
- 系统自动生成提交信息并推送到 GitHub

**方式 2：自定义提交**
1. 切换到"Git 管理" Tab
2. 查看仓库状态和更改预览
3. 输入提交信息
4. 选择"提交"或"提交并推送"

## 文件结构

```
cms/
├── backend/              # FastAPI 后端
│   ├── main.py          # 主应用
│   ├── api/             # API 路由
│   ├── services/        # 业务逻辑
│   └── models/          # 数据模型
├── frontend/            # 前端界面
│   ├── index.html       # 主页面
│   ├── css/             # 样式
│   └── js/              # JavaScript
├── requirements.txt     # Python 依赖
└── README.md           # 本文档
```

## 数据存储

CMS 直接修改以下文件：

- `_data/publications.yml` - 论文数据
- `index.md` - 主页内容（新闻、About Me）
- `_config.yml` - Jekyll 配置（个人信息）
- `assets/img/` - 图片文件
- `assets/bib/` - BibTeX 文件

**备份位置**：`.cms_backups/`（自动创建，保留最近 10 个版本）

## API 文档

启动 CMS 后，访问以下 URL 查看完整 API 文档：

- **Swagger UI**：http://localhost:8000/docs
- **ReDoc**：http://localhost:8000/redoc

## 常见问题

### 1. 无法启动 CMS

**问题**：`ImportError: No module named 'fastapi'`

**解决**：
```bash
pip install -r requirements.txt
```

### 2. 修改没有生效

**问题**：修改保存后，主页没有更新

**解决**：
- 检查 Git 状态，确保更改已提交
- 推送到 GitHub 后，等待 GitHub Pages 重新构建（约 1-2 分钟）

### 3. 图片显示不正常

**问题**：上传图片后显示损坏

**解决**：
- 检查图片格式（推荐 JPG/PNG）
- 确保图片大小不超过 5MB
- 检查 `assets/img/` 目录权限

### 4. Git 推送失败

**问题**：`Permission denied` 或 `Authentication failed`

**解决**：
- 检查 Git 凭据配置
- 确保有仓库的写权限
- 检查当前分支名是否正确

## 高级功能（未来）

以下功能计划在未来版本中实现：

- [ ] Google Scholar 自动抓取论文信息
- [ ] Overleaf CV 自动同步
- [ ] 主题切换系统
- [ ] 多语言支持
- [ ] 批量操作
- [ ] 数据导入/导出

## 安全提示

- CMS 运行在本地，不对外暴露
- 如需在服务器上运行，请配置防火墙和认证
- 定期备份仓库

## 开发者

本 CMS 系统专为 Jekyll Minimal Light 主题设计，可根据需要扩展和定制。

## 许可证

MIT License

---

如有问题或建议，请创建 GitHub Issue。
