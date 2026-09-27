$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$out = "c:\Users\puran\OneDrive\Desktop\Trustee\owner\snap_dash_full.png"
$tmpDir = "C:\Users\puran\AppData\Local\Temp\edge_snap_dash_full"

if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }

Start-Process -FilePath $edge -ArgumentList @(
    "--headless",
    "--disable-gpu",
    "--user-data-dir=$tmpDir",
    "--window-size=1600,1600",
    "--run-all-compositor-stages-before-draw",
    "--screenshot=$out",
    "file:///c:/Users/puran/OneDrive/Desktop/Trustee/owner/dashboard/dashboard.html"
) -PassThru -Wait

Write-Host "Captured full height dashboard: " (Test-Path $out)
