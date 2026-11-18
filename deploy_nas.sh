#!/usr/bin/env bash
#
# results 一鍵部署：打包 → 上傳 → 解壓 → 重建容器 → 驗證
# 流程細節與密碼處理見 ../_deploy_lib.sh
#
# 2026-08-23 從 expect 改寫為 bash：裝了 SSH 金鑰之後 scp/ssh 不再出現
# 密碼提示，舊 expect 腳本等不到 "assword" 就對已關閉的連線操作，
# 檔案上傳成功但容器從未重建。

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
source "$SCRIPT_DIR/../_deploy_lib.sh"

REMOTE_DIR="/volume1/docker/ccmtc-results"
TGZ_NAME="ccmtc-results-deploy.tar.gz"
TGZ="/tmp/$TGZ_NAME"

ccmtc_connect_check
ccmtc_require_remote_env "$COMPOSE_DIR"
ccmtc_pack "$TGZ"
ccmtc_upload "$TGZ" "$REMOTE_DIR"
ccmtc_remote_rebuild "$REMOTE_DIR" "$TGZ_NAME" "results" "yes"
ccmtc_verify "https://ccmtc.mooo.com/results" ccmtc-results

echo
echo "🎉 部署流程結束！服務運行於 https://ccmtc.mooo.com/results"
