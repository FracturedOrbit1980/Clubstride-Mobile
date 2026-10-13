Add-Type -AssemblyName System.Drawing
$srcPath = "C:\Users\Robert.Delport\.gemini\antigravity\scratch\gameon-app\icon.jpg"
$src = [System.Drawing.Image]::FromFile($srcPath)

function Resize-Image($w, $h, $dest) {
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($src, 0, 0, $w, $h)
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

Resize-Image 180 180 "C:\Users\Robert.Delport\.gemini\antigravity\scratch\gameon-app\icon-180.png"
Resize-Image 192 192 "C:\Users\Robert.Delport\.gemini\antigravity\scratch\gameon-app\icon-192.png"
Resize-Image 512 512 "C:\Users\Robert.Delport\.gemini\antigravity\scratch\gameon-app\icon-512.png"
Resize-Image 512 512 "C:\Users\Robert.Delport\.gemini\antigravity\scratch\gameon-app\icon.png"
$src.Dispose()

$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\Users\Robert.Delport\.gemini\antigravity\scratch\gameon-app\icon-192.png"))
[IO.File]::WriteAllText("C:\Users\Robert.Delport\.gemini\antigravity\scratch\gameon-app\icon_b64_png.txt", $b64)
Write-Host "Success generating PNG icons"
