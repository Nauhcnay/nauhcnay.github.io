# CMS 快速入门指南

## 🚀 5 分钟快速上手

### 第一步：安装依赖

```bash
cd cms
pip install -r requirements.txt
```

### 第二步：启动 CMS

```bash
# 使用启动脚本（推荐）
./start.sh

# 或者手动启动
cd ..
python -m uvicorn cms.backend.main:app --reload --host 0.0.0.0 --port 8000
```

### 第三步：打开浏览器

访问：**http://localhost:8000**

---

## 📝 常用操作

### 添加一篇新论文

1. 点击"论文管理" Tab
2. 点击"添加论文"
3. 填写信息：
   ```
   标题: ShadowMagic: Human-Aware Mobile AR Occlusion
   作者: Chuan Yan, Yicheng He, Voicu Popescu
   会议简称: UIST 2024
   完整会议名: ACM Symposium on User Interface Software and Technology
   PDF链接: https://dl.acm.org/...
   ```
4. 上传缩略图（可选）
5. 上传 BibTeX 文件（可选）
6. 勾选"Featured"如果是重点论文
7. 点击"保存"

### 添加新闻动态

1. 点击"新闻动态" Tab
2. 点击"添加新闻"
3. 输入：
   ```
   日期: 2024-10
   内容: Our paper **ShadowMagic** has been accepted to UIST 2024!
   ```
4. 点击"保存"

### 更新个人信息

1. 点击"个人信息" Tab
2. 编辑你想要修改的字段
3. 点击"保存个人信息"

### 提交到 GitHub

**方法 1：快速同步（推荐）**
- 点击右上角"提交并推送"按钮
- 系统自动完成提交和推送

**方法 2：自定义提交**
1. 切换到"Git 管理" Tab
2. 查看更改
3. 输入提交信息
4. 点击"提交并推送"

---

## 💡 提示

- **自动备份**：每次修改前，CMS 会自动创建备份到 `.cms_backups/` 目录
- **实时预览**：可以在 CMS 中查看更改，然后提交到 GitHub
- **API 文档**：访问 http://localhost:8000/docs 查看完整 API 文档

---

## 🔧 故障排除

### 问题：依赖安装失败

```bash
# 尝试升级 pip
pip install --upgrade pip

# 重新安装
pip install -r requirements.txt
```

### 问题：端口被占用

```bash
# 更改端口
python -m uvicorn cms.backend.main:app --reload --port 8001
```

### 问题：Git 推送失败

```bash
# 检查 Git 配置
git config --list

# 确保你有写权限
git remote -v
```

---

## 📚 更多信息

详细文档请查看：[README.md](README.md)

---

**Happy Coding! 🎉**
