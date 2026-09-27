$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$modules = @('my-vaults', 'trustees', 'invitations', 'share-management', 'release-management', 'notifications', 'activity-history', 'profile-security', 'help-support')

foreach ($m in $modules) {
    $out = "c:\Users\puran\OneDrive\Desktop\Trustee\owner\snap_$m.png"
    $url = "file:///c:/Users/puran/OneDrive/Desktop/Trustee/owner/$m/$m.html"
    $tmpDir = "C:\Users\puran\AppData\Local\Temp\edge_snap_$m"
    if (Test-Path $tmpDir) { Remove-Item -Recurse -Force $tmpDir -ErrorAction SilentlyContinue }
    Start-Process -FilePath $edge -ArgumentList @(
        '--headless',
        '--disable-gpu',
        "--user-data-dir=$tmpDir",
        '--window-size=1600,1600',
        '--run-all-compositor-stages-before-draw',
        "--screenshot=$out",
        $url
    ) -PassThru -Wait
    Write-Host "Done $m : $(Test-Path $out)"
}
