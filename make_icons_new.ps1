Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Drawing.Imaging

$srcPath = "C:\Users\Robert.Delport\.gemini\antigravity\scratch\Clubstride Mobile-app\logo_new.jpg"
$appDir  = "C:\Users\Robert.Delport\.gemini\antigravity\scratch\Clubstride Mobile-app"

# Load source image
$src = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Source image: $($src.Width) x $($src.Height)"

function Save-PngIcon($src, $size, $outPath) {
    # Create transparent bitmap
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g   = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    # Scale source maintaining aspect ratio, center it
    $srcW = $src.Width; $srcH = $src.Height
    $scale = [Math]::Min($size / $srcW, $size / $srcH)
    $dstW  = [int]($srcW * $scale)
    $dstH  = [int]($srcH * $scale)
    $x     = [int](($size - $dstW) / 2)
    $y     = [int](($size - $dstH) / 2)

    $destRect = New-Object System.Drawing.Rectangle($x, $y, $dstW, $dstH)
    $g.DrawImage($src, $destRect)
    $g.Dispose()

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Saved: $outPath ($size x $size)"
}

# Generate all sizes
Save-PngIcon $src 192 "$appDir\icon-192.png"
Save-PngIcon $src 512 "$appDir\icon-512.png"
Save-PngIcon $src 180 "$appDir\icon-180.png"
Save-PngIcon $src 512 "$appDir\icon.png"

$src.Dispose()

# Convert new 192 PNG to base64
$bytes192 = [System.IO.File]::ReadAllBytes("$appDir\icon-192.png")
$b64_192  = [Convert]::ToBase64String($bytes192)
[System.IO.File]::WriteAllText("$appDir\icon_b64_png.txt", $b64_192)
Write-Host "icon_b64_png.txt written ($($b64_192.Length) chars)"

# Convert new JPG to base64 (for fallback)
$bytesJpg = [System.IO.File]::ReadAllBytes($srcPath)
$b64_jpg  = [Convert]::ToBase64String($bytesJpg)
[System.IO.File]::WriteAllText("$appDir\icon_b64.txt", $b64_jpg)
Write-Host "icon_b64.txt written ($($b64_jpg.Length) chars)"

Write-Host "All icons generated successfully!"


