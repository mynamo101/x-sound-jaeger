# 文件監控腳本 - 自動同步 JS 檔案
$sourceDir = "src\js"
$targetDir = "public\js"

Write-Host "啟動文件監控..."
Write-Host "監控目錄: $sourceDir"
Write-Host "目標目錄: $targetDir"
Write-Host "按 Ctrl+C 停止監控"

# 確保目標目錄存在
if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force
}

# 創建文件系統監控器
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $sourceDir
$watcher.Filter = "*.js"
$watcher.IncludeSubdirectories = $false
$watcher.EnableRaisingEvents = $true

# 定義事件處理函數
$action = {
    $path = $Event.SourceEventArgs.FullPath
    $fileName = Split-Path $path -Leaf
    $changeType = $Event.SourceEventArgs.ChangeType
    $timeStamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "[$timeStamp] 檔案 $fileName 已 $changeType"
    
    # 只同步特定檔案
    if ($fileName -eq "membership-auth.js" -or $fileName -eq "notification-system.js") {
        $targetFile = Join-Path $targetDir $fileName
        Start-Sleep -Milliseconds 100  # 等待檔案寫入完成
        
        try {
            Copy-Item $path $targetFile -Force
            Write-Host "  → 已同步到 $targetFile" -ForegroundColor Green
        }
        catch {
            Write-Host "  → 同步失敗: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# 註冊事件
Register-ObjectEvent -InputObject $watcher -EventName "Changed" -Action $action
Register-ObjectEvent -InputObject $watcher -EventName "Created" -Action $action

# 初始同步
Write-Host "執行初始同步..."
if (Test-Path "src\js\membership-auth.js") {
    Copy-Item "src\js\membership-auth.js" "public\js\membership-auth.js" -Force
    Write-Host "  → membership-auth.js 已同步" -ForegroundColor Green
}
if (Test-Path "src\js\notification-system.js") {
    Copy-Item "src\js\notification-system.js" "public\js\notification-system.js" -Force
    Write-Host "  → notification-system.js 已同步" -ForegroundColor Green
}

Write-Host "監控已啟動，等待檔案變更..." -ForegroundColor Yellow

try {
    while ($true) {
        Start-Sleep 1
    }
}
finally {
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Host "監控已停止" -ForegroundColor Yellow
}
