@echo off
rem 把本补丁安装（覆盖复制）到本机 ComfyUI 的 custom_nodes。
rem 路径如不同请修改下面的 DEST。
setlocal
set "SRC=%~dp0"
set "DEST=D:\Softwares\ComfyUI\ComfyUI\custom_nodes\zml-bbox-canvas-ratio-fix"

xcopy /E /I /Y "%SRC%web" "%DEST%\web\" >nul
copy /Y "%SRC%__init__.py" "%DEST%\" >nul
copy /Y "%SRC%README.md" "%DEST%\" >nul
echo 已安装到 %DEST%
echo 重启 ComfyUI 生效。
pause
