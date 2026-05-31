Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$iconDir = Join-Path $root "icons"
New-Item -ItemType Directory -Force -Path $iconDir | Out-Null

function New-RoundedRectanglePath {
  param(
    [float] $X,
    [float] $Y,
    [float] $Width,
    [float] $Height,
    [float] $Radius
  )

  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $Radius * 2
  $path.AddArc($X, $Y, $diameter, $diameter, 180, 90)
  $path.AddArc($X + $Width - $diameter, $Y, $diameter, $diameter, 270, 90)
  $path.AddArc($X + $Width - $diameter, $Y + $Height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($X, $Y + $Height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-Icon {
  param([int] $Size)

  $bitmap = [System.Drawing.Bitmap]::new($Size, $Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $scale = $Size / 128.0
  $purple = [System.Drawing.Color]::FromArgb(255, 88, 101, 242)
  $purpleDark = [System.Drawing.Color]::FromArgb(255, 62, 72, 186)
  $white = [System.Drawing.Color]::FromArgb(255, 255, 255, 255)
  $ink = [System.Drawing.Color]::FromArgb(255, 38, 43, 64)
  $red = [System.Drawing.Color]::FromArgb(255, 241, 73, 91)

  $background = New-RoundedRectanglePath (6 * $scale) (6 * $scale) (116 * $scale) (116 * $scale) (28 * $scale)
  $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.PointF]::new(18 * $scale, 10 * $scale),
    [System.Drawing.PointF]::new(110 * $scale, 120 * $scale),
    $purple,
    $purpleDark
  )
  $graphics.FillPath($brush, $background)

  $face = New-RoundedRectanglePath (27 * $scale) (20 * $scale) (74 * $scale) (42 * $scale) (18 * $scale)
  $graphics.FillPath([System.Drawing.SolidBrush]::new($white), $face)

  $earLeft = [System.Drawing.RectangleF]::new(37 * $scale, 15 * $scale, 17 * $scale, 15 * $scale)
  $earRight = [System.Drawing.RectangleF]::new(74 * $scale, 15 * $scale, 17 * $scale, 15 * $scale)
  $graphics.FillEllipse([System.Drawing.SolidBrush]::new($white), $earLeft)
  $graphics.FillEllipse([System.Drawing.SolidBrush]::new($white), $earRight)

  $graphics.FillEllipse([System.Drawing.SolidBrush]::new($ink), [System.Drawing.RectangleF]::new(46 * $scale, 36 * $scale, 8 * $scale, 9 * $scale))
  $graphics.FillEllipse([System.Drawing.SolidBrush]::new($ink), [System.Drawing.RectangleF]::new(74 * $scale, 36 * $scale, 8 * $scale, 9 * $scale))

  $smilePen = [System.Drawing.Pen]::new($ink, [Math]::Max(2, 4 * $scale))
  $smilePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $smilePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawArc($smilePen, [System.Drawing.RectangleF]::new(53 * $scale, 36 * $scale, 23 * $scale, 18 * $scale), 25, 130)

  $arrowPen = [System.Drawing.Pen]::new($white, [Math]::Max(2, 8 * $scale))
  $arrowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $arrowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $arrowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $graphics.DrawLine($arrowPen, 80 * $scale, 76 * $scale, 80 * $scale, 92 * $scale)
  $graphics.DrawLine($arrowPen, 80 * $scale, 92 * $scale, 38 * $scale, 92 * $scale)
  $graphics.DrawLine($arrowPen, 38 * $scale, 92 * $scale, 52 * $scale, 78 * $scale)
  $graphics.DrawLine($arrowPen, 38 * $scale, 92 * $scale, 52 * $scale, 106 * $scale)

  $crossPen = [System.Drawing.Pen]::new($red, [Math]::Max(3, 10 * $scale))
  $crossPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $crossPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $graphics.DrawLine($crossPen, 66 * $scale, 78 * $scale, 96 * $scale, 108 * $scale)
  $graphics.DrawLine($crossPen, 96 * $scale, 78 * $scale, 66 * $scale, 108 * $scale)

  $bitmap.Save((Join-Path $iconDir "icon-$Size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

16, 32, 48, 128 | ForEach-Object { Draw-Icon $_ }
