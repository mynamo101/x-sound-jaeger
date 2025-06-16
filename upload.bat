@echo off
REM 替换下面的参数
set HOST=139.162.106.254
set USER=mynamo101
set PASS=My331619@
set PORT=22

REM 上传 dist 文件夹内容到指定目录（SFTP）- 只上传修改的文件
"C:\Program Files (x86)\WinSCP\WinSCP.com" ^
  /command "open sftp://%USER%:%PASS%@%HOST%:%PORT%" ^
  "lcd dist" ^
  "cd x.soundjaeger.com/dist" ^
  "synchronize remote -delete" ^
  "exit"