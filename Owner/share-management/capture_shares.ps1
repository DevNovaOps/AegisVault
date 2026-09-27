$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$darkOut = "c:\Users\puran\OneDrive\Desktop\Trustee\owner\share-management\snap_shares_dark.png"
$lightOut = "c:\Users\puran\OneDrive\Desktop\Trustee\owner\share-management\snap_shares_light.png"
$tmpDarkDir = "C:\Users\puran\AppData\Local\Temp\edge_snap_shares_dark"
$tmpLightDir = "C:\Users\puran\AppData\Local\Temp\edge_snap_shares_light"

if (Test-Path $tmpDarkDir) { Remove-Item -Recurse -Force $tmpDarkDir -ErrorAction SilentlyContinue }
if (Test-Path $tmpLightDir) { Remove-Item -Recurse -Force $tmpLightDir -ErrorAction SilentlyContinue }

Write-Host "Capturing Dark Mode..."
$proc1 = Start-Process -FilePath $edge -ArgumentList @(
    "--headless",
    "--disable-gpu",
    "--user-data-dir=$tmpDarkDir",
    "--window-size=1600,1080",
    "--run-all-compositor-stages-before-draw",
    "--screenshot=$darkOut",
    "file:///c:/Users/puran/OneDrive/Desktop/Trustee/owner/share-management/share-management.html"
) -PassThru -Wait

Write-Host "Dark screenshot captured: " (Test-Path $darkOut)

# Create light mode snap page
$html = Get-Content "c:\Users\puran\OneDrive\Desktop\Trustee\owner\share-management\share-management.html" -Raw
$lightHtml = $html.Replace('data-theme="dark"', 'data-theme="light"').Replace("savedTheme === 'light' || savedTheme === 'dark'", "false").Replace("document.documentElement.setAttribute('data-theme', 'dark');", "document.documentElement.setAttribute('data-theme', 'light');")
Set-Content "c:\Users\puran\OneDrive\Desktop\Trustee\owner\share-management\share_management_light_temp.html" $lightHtml

Write-Host "Capturing Light Mode..."
$proc2 = Start-Process -FilePath $edge -ArgumentList @(
    "--headless",
    "--disable-gpu",
    "--user-data-dir=$tmpLightDir",
    "--window-size=1600,1080",
    "--run-all-compositor-stages-before-draw",
    "--screenshot=$lightOut",
    "file:///c:/Users/puran/OneDrive/Desktop/Trustee/owner/share-management/share_management_light_temp.html"
) -PassThru -Wait

Write-Host "Light screenshot captured: " (Test-Path $lightOut)

Remove-Item "c:\Users\puran\OneDrive\Desktop\Trustee\owner\share-management\share_management_light_temp.html" -Force -ErrorAction SilentlyContinue
