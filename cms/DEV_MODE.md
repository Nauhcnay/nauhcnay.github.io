# 开发模式说明

## 🚀 启动方式对比

### 1. 标准模式（推荐日常使用）

```bash
./start.sh
```

**特点：**
- ✅ 自动重载 Python 代码
- ✅ 监控 cms 目录下的文件变化
- ✅ 标准日志输出

**适用场景：**
- 日常使用 CMS 管理内容
- 添加/编辑论文、新闻

---

### 2. 开发模式（推荐开发调试）

```bash
./start-dev.sh
```

**特点：**
- ✅ 自动重载所有相关文件（Python, HTML, CSS, JS, YAML, Markdown）
- ✅ 监控多个目录：
  - `cms/backend/` - 后端代码
  - `cms/frontend/` - 前端代码
  - `_data/` - YAML 数据文件
- ✅ **详细的调试日志**（debug 级别）
- ✅ 访问日志（每个请求都会记录）

**适用场景：**
- 开发新功能
- 调试问题
- 修改前端界面
- **从 Git 拉取更新后自动生效**

---

### 3. 手动启动

```bash
cd ..
python -m uvicorn cms.backend.main:app --reload --host 0.0.0.0 --port 8000
```

**适用场景：**
- 需要自定义启动参数
- 使用不同的端口

---

## 🔄 自动重载机制

### 开发模式会监控以下文件类型：

| 文件类型 | 说明 | 示例 |
|---------|------|------|
| `*.py` | Python 代码 | 后端 API、服务层 |
| `*.html` | HTML 模板 | 前端界面 |
| `*.css` | 样式文件 | 界面样式 |
| `*.js` | JavaScript | 前端逻辑 |
| `*.yml`, `*.yaml` | YAML 数据 | publications.yml, _config.yml |
| `*.md` | Markdown | index.md |

### 监控目录：

```
nauhcnay.github.io/
├── cms/
│   ├── backend/        ← 监控
│   └── frontend/       ← 监控
└── _data/              ← 监控（仅开发模式）
```

---

## 📝 使用建议

### 日常使用：
```bash
cd cms
./start.sh
```

### 开发/调试：
```bash
cd cms
./start-dev.sh
```

### 从 Git 拉取更新后：
**无需手动重启！** 如果使用开发模式，检测到文件变化会自动重启。

你会看到类似的输出：
```
INFO:     Will watch for changes in these directories: ['cms/backend', 'cms/frontend', '_data']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]

# 当文件变化时：
WARNING:  WatchFiles detected changes in 'cms/backend/services/yaml_handler.py'. Reloading...
INFO:     Shutting down
INFO:     Finished server process [12346]
INFO:     Started server process [12347]
INFO:     Application startup complete.
```

---

## 🐛 调试技巧

### 查看详细日志：
使用开发模式 `./start-dev.sh`，会显示：
- 每个 API 请求
- 文件变化检测
- 详细的错误堆栈

### 测试文件监控：
1. 启动开发模式
2. 修改任意监控的文件（如 `cms/frontend/index.html`）
3. 保存文件
4. 观察终端输出，应该看到"Reloading..."信息
5. 刷新浏览器，更改应该已经生效

### 常见问题：

**Q: 修改了文件但没有自动重载？**
- 确保使用了 `--reload` 参数
- 检查文件是否在监控目录内
- 尝试重启服务

**Q: 重载太频繁？**
- 使用标准模式 `./start.sh`（只监控 cms 目录）
- 或者修改 start-dev.sh，移除不需要的监控目录

**Q: 想自定义监控的文件类型？**
编辑 `start-dev.sh`，添加或删除 `--reload-include` 行

---

## 🎯 最佳实践

1. **开发时使用开发模式**：
   ```bash
   ./start-dev.sh
   ```
   所有更改自动生效，无需手动重启

2. **生产环境不使用 reload**：
   ```bash
   python -m uvicorn cms.backend.main:app --host 0.0.0.0 --port 8000
   ```
   （去掉 `--reload` 参数）

3. **Git 工作流**：
   ```bash
   # 1. 启动开发模式
   ./start-dev.sh

   # 2. 在另一个终端拉取更新
   git pull origin your-branch

   # 3. 服务自动重启，刷新浏览器即可
   ```

---

## 📊 性能对比

| 模式 | 重载速度 | CPU 使用 | 适用场景 |
|-----|---------|---------|---------|
| 标准模式 | 快 | 低 | 日常使用 |
| 开发模式 | 稍慢 | 中 | 开发调试 |
| 生产模式 | - | 最低 | 部署服务器 |

---

Happy Coding! 🎉
