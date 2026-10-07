# AegisVault Backend - Start Celery Worker & Beat
# Make sure Redis is running before executing this script!

Write-Host "Starting Celery Worker..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot; python -m celery -A config worker -l info --pool=solo" -WindowStyle Normal

Write-Host "Starting Celery Beat..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PSScriptRoot; python -m celery -A config beat -l info" -WindowStyle Normal

Write-Host "Celery processes launched in new windows." -ForegroundColor Green
