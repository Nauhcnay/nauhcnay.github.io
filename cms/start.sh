#!/bin/bash

# Personal Homepage CMS 启动脚本

echo "================================"
echo "Personal Homepage CMS"
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

# 检查依赖是否安装
if ! python3 -c "import fastapi" &> /dev/null; then
    echo "📦 检测到缺少依赖，正在安装..."
    pip3 install -r requirements.txt

    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
    echo ""
fi

# 启动服务
echo "🚀 正在启动 CMS..."
echo "   访问地址：http://localhost:8000"
echo "   API 文档：http://localhost:8000/docs"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""
echo "================================"
echo ""

cd ..
python3 -m uvicorn cms.backend.main:app \
    --reload \
    --reload-dir cms \
    --reload-include "*.py" \
    --reload-include "*.html" \
    --reload-include "*.css" \
    --reload-include "*.js" \
    --reload-include "*.yml" \
    --reload-include "*.yaml" \
    --reload-include "*.md" \
    --host 0.0.0.0 \
    --port 8000 \
    --log-level info
