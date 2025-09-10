@echo off
setlocal enabledelayedexpansion

rem Start counter at 1
set cnt=1

rem Loop over all common image extensions
for %%F in (*.jpg *.jpeg *.png *.gif *.bmp) do (
    rem Extract the file extension (including the dot)
    set "ext=%%~xF"
    rem Rename file to Chair<counter><extension>
    ren "%%F" "Chair!cnt!!ext!"
    rem Increment counter
    set /a cnt+=1
)

endlocal
