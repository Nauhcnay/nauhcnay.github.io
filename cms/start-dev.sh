#!/bin/bash

# Personal Homepage CMS - 开发模式启动脚本（增强版）

echo "================================"
echo "Personal Homepage CMS (DEV MODE)"
echo "================================"
echo ""

# 检查是否在正确的目录
if [ ! -f "../_config.yml" ]; then
    echo "❌ 错误：请确保你在 cms 目录中运行此脚本"
    echo "   正确的路径应该是：/path/to/nauhcnay.github.io/cms/"
    exit 1
fi

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到 Python 3"
    echo "   请先安装 Python 3.8 或更高版本"
    exit 1
fi

echo "🔧 开发模式特性："
echo "   ✅ 自动监控文件变化（Python, HTML, CSS, JS, YAML, Markdown）"
echo "   ✅ 检测到更改自动重启服务"
echo "   ✅ 详细的调试日志"
echo ""
echo "📂 监控目录："
echo "   - cms/backend/    (Python 代码)"
echo "   - cms/frontend/   (HTML/CSS/JS)"
echo "   - _data/          (YAML 数据文件)"
echo ""
echo "🚀 正在启动 CMS..."
echo "   访问地址：http://localhost:8000"
echo "   API 文档：http://localhost:8000/docs"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""
echo "================================"
echo ""

cd ..

# 开发模式启动，监控所有相关文件
python3 -m uvicorn cms.backend.main:app \
    --reload \
    --reload-dir cms/backend \
    --reload-dir cms/frontend \
    --reload-dir _data \
    --reload-include "*.py" \
    --reload-include "*.html" \
    --reload-include "*.css" \
    --reload-include "*.js" \
    --reload-include "*.yml" \
    --reload-include "*.yaml" \
    --reload-include "*.md" \
    --host 0.0.0.0 \
    --port 8000 \
    --log-level debug \
    --access-log
