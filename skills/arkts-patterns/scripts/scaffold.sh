#!/bin/bash
# =============================================================================
# arkts-patterns scaffold.sh - 快速脚手架工具
# =============================================================================
# 用法:
#   ./scaffold.sh <target-dir> <bundle-name>
#
# 示例:
#   ./scaffold.sh ./my-app com.mycompany.myapp
#   ./scaffold.sh ~/projects/new-harmony-app com.example.demo
#
# 功能:
#   1. 复制 empty-ability-template/ 到目标目录
#   2. 替换 AppScope/app.json5 中的 bundleName
#   3. 替换 vendor 为 bundleName 的第二段
# =============================================================================

set -euo pipefail

# --- 参数检查 ---
if [ $# -lt 2 ]; then
    echo "用法: $0 <target-dir> <bundle-name>"
    echo ""
    echo "参数:"
    echo "  target-dir    目标目录（将创建如果不存在）"
    echo "  bundle-name   应用包名（如 com.company.app）"
    echo ""
    echo "示例:"
    echo "  $0 ./my-app com.mycompany.myapp"
    echo "  $0 ~/projects/demo com.example.demo"
    exit 1
fi

TARGET_DIR="$1"
BUNDLE_NAME="$2"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMPLATE_DIR="$(dirname "$SCRIPT_DIR")/empty-ability-template"

# --- 验证模板目录 ---
if [ ! -d "$TEMPLATE_DIR" ]; then
    echo "错误: 找不到模板目录: $TEMPLATE_DIR"
    exit 1
fi

# --- 验证 bundleName 格式 ---
if ! echo "$BUNDLE_NAME" | grep -qE '^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*)+$'; then
    echo "错误: bundleName 格式无效: $BUNDLE_NAME"
    echo "  期望格式: com.example.app"
    exit 1
fi

# 从 bundleName 提取 vendor（取第二段）
VENDOR=$(echo "$BUNDLE_NAME" | cut -d. -f2)

# --- 检查目标目录 ---
if [ -d "$TARGET_DIR" ] && [ "$(ls -A "$TARGET_DIR" 2>/dev/null)" ]; then
    echo "警告: 目标目录已存在且非空: $TARGET_DIR"
    printf "是否覆盖? [y/N] "
    read -r REPLY
    if [ "$REPLY" != "y" ] && [ "$REPLY" != "Y" ]; then
        echo "已取消"
        exit 0
    fi
fi

# --- 复制模板 ---
echo "正在复制模板..."
mkdir -p "$TARGET_DIR"
cp -r "$TEMPLATE_DIR"/* "$TEMPLATE_DIR"/.[!.]* "$TARGET_DIR/" 2>/dev/null || true

# --- 替换 bundleName 和 vendor ---
APP_JSON5="$TARGET_DIR/AppScope/app.json5"
if [ -f "$APP_JSON5" ]; then
    echo "正在配置包名..."
    # macOS 和 Linux 兼容的 sed 替换
    if [[ "$(uname)" == "Darwin" ]]; then
        sed -i '' "s/\"bundleName\": \"[^\"]*\"/\"bundleName\": \"$BUNDLE_NAME\"/" "$APP_JSON5"
        sed -i '' "s/\"vendor\": \"[^\"]*\"/\"vendor\": \"$VENDOR\"/" "$APP_JSON5"
    else
        sed -i "s/\"bundleName\": \"[^\"]*\"/\"bundleName\": \"$BUNDLE_NAME\"/" "$APP_JSON5"
        sed -i "s/\"vendor\": \"[^\"]*\"/\"vendor\": \"$VENDOR\"/" "$APP_JSON5"
    fi
fi

echo ""
echo "脚手架完成!"
echo "  目标目录: $TARGET_DIR"
echo "  包名:     $BUNDLE_NAME"
echo "  厂商:     $VENDOR"
echo ""
echo "后续步骤:"
echo "  cd $TARGET_DIR"
echo "  ohpm install"
echo "  # 用 DevEco Studio 打开 $TARGET_DIR"
