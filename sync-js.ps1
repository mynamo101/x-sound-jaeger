# 自動同步 src/js 到 public/js 的腳本
Write-Host "同步 JS 檔案..."

# 確保 public/js 目錄存在
if (!(Test-Path "public\js")) {
    New-Item -ItemType Directory -Path "public\js" -Force
}

# 複製 JS 檔案
Copy-Item "src\js\membership-auth.js" "public\js\membership-auth.js" -Force
Copy-Item "src\js\notification-system.js" "public\js\notification-system.js" -Force

Write-Host "JS 檔案同步完成！"
Write-Host "- membership-auth.js"
Write-Host "- notification-system.js"
