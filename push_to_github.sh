#!/usr/bin/env bash
# 用 github_token.txt 里的 API Key 推送（无需 gh 登录态）。
# token 文件已被 .gitignore 排除，不会进版本库。
set -euo pipefail
cd "$(dirname "$0")"

TOKEN_FILE="github_token.txt"
[ -s "$TOKEN_FILE" ] || { echo "请先把 GitHub API Key 写入 $TOKEN_FILE"; exit 1; }
TOKEN="$(tr -d '\r\n' "$TOKEN_FILE")"

ME="$(curl -fsS -H "Authorization: Bearer $TOKEN" https://api.github.com/user \
      | python -c "import sys,json;print(json.load(sys.stdin)['login'])")"
REPO="$(basename "$(pwd)")"

# 仓库不存在则创建（已存在则跳过）
curl -fsS -o /dev/null -X POST \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO\",\"description\":\"ComfyUI patch: CreateBoundingBoxes canvas follows real resolution aspect ratio\"}" \
  || echo "仓库可能已存在，继续推送..."

git push "https://x-access-token:${TOKEN}@github.com/${ME}/${REPO}.git" HEAD:main
echo "推送完成: https://github.com/${ME}/${REPO}"
