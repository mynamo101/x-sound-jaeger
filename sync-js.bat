@echo off
echo 同步 JS 檔案...

REM 確保 public\js 目錄存在
if not exist "public\js" mkdir "public\js"

REM 複製 JS 檔案
copy "src\js\membership-auth.js" "public\js\membership-auth.js" /Y
copy "src\js\notification-system.js" "public\js\notification-system.js" /Y

echo JS 檔案同步完成！
echo - membership-auth.js
echo - notification-system.js
