#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PKG_MGR="npm"
if command -v pnpm >/dev/null 2>&1; then
  PKG_MGR="pnpm"
elif command -v yarn >/dev/null 2>&1; then
  PKG_MGR="yarn"
fi

DIST_DIR="$ROOT_DIR/dist"
mkdir -p "$DIST_DIR"

# 清理旧产物
rm -rf "$DIST_DIR/output" \
       "$DIST_DIR/output.tar.gz"
rm -rf .output

# 标准构建
if [ "$PKG_MGR" = "yarn" ]; then
  yarn build
else
  "$PKG_MGR" run build
fi

# 重命名并压缩区分标准模式
mv .output "$DIST_DIR/output"
tar -czf "$DIST_DIR/output.tar.gz" -C "$DIST_DIR" "output"

echo "Build artifacts created:"
echo " - $DIST_DIR/output (standard build)"
echo " - $DIST_DIR/output.tar.gz"
