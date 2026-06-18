# عروضي (Oroudi) Quotation Editor - minimal local web server.
#
# Why this exists: the editor needs to run from a real http://localhost origin (not file://)
# so that (a) saved quotations always live under one stable origin, and (b) the silent
# automatic backup (File System Access API) is allowed, which requires a secure context.
#
# It uses only built-in Windows PowerShell + .NET (System.Net.Sockets) -- no Node, no Python,
# no admin rights, no firewall changes (binds to loopback 127.0.0.1 only). It serves the files
# next to this script and shuts itself down after a period with no requests (i.e. once the app
# window is closed), so nothing lingers in the background.

[CmdletBinding()]
param(
  [int]$Port = 8137,
  [int]$IdleShutdownMinutes = 15
)

$ErrorActionPreference = "Stop"
# The web app lives in the public/ subfolder (the same files Cloudflare serves).
$root = Join-Path $PSScriptRoot "public"

$mimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".js"   = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".woff2" = "font/woff2"
  ".woff" = "font/woff"
  ".ttf"  = "font/ttf"
  ".txt"  = "text/plain; charset=utf-8"
}

try {
  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
  $listener.Start()
} catch {
  # Port already in use most likely means the server is already running -- just exit quietly.
  return
}

$lastActivity = [System.Diagnostics.Stopwatch]::StartNew()
$idleLimit = [TimeSpan]::FromMinutes($IdleShutdownMinutes)

function Send-Response {
  param($stream, [int]$status, [string]$statusText, [string]$contentType, [byte[]]$body)

  $headerText = "HTTP/1.1 $status $statusText`r`n" +
    "Content-Type: $contentType`r`n" +
    "Content-Length: $($body.Length)`r`n" +
    "Cache-Control: no-cache`r`n" +
    "Connection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headerText)
  $stream.Write($headerBytes, 0, $headerBytes.Length)
  if ($body.Length -gt 0) { $stream.Write($body, 0, $body.Length) }
  $stream.Flush()
}

try {
  while ($true) {
    if (-not $listener.Pending()) {
      if ($lastActivity.Elapsed -gt $idleLimit) { break }
      Start-Sleep -Milliseconds 200
      continue
    }

    $lastActivity.Restart()
    $client = $listener.AcceptTcpClient()

    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII)
      $requestLine = $reader.ReadLine()
      if (-not $requestLine) { continue }

      $parts = $requestLine.Split(" ")
      $rawPath = if ($parts.Length -ge 2) { $parts[1] } else { "/" }
      $rawPath = $rawPath.Split("?")[0]
      $decoded = [System.Uri]::UnescapeDataString($rawPath)
      if ($decoded -eq "/" -or [string]::IsNullOrWhiteSpace($decoded)) { $decoded = "/index.html" }

      $relative = $decoded.TrimStart("/").Replace("/", "\")
      $candidate = [System.IO.Path]::GetFullPath((Join-Path $root $relative))

      # Block path traversal: the resolved file must stay inside the app folder.
      if (-not $candidate.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
        Send-Response $stream 403 "Forbidden" "text/plain; charset=utf-8" ([System.Text.Encoding]::UTF8.GetBytes("Forbidden"))
      } elseif (Test-Path -LiteralPath $candidate -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($candidate).ToLowerInvariant()
        $type = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
        $bytes = [System.IO.File]::ReadAllBytes($candidate)
        Send-Response $stream 200 "OK" $type $bytes
      } else {
        Send-Response $stream 404 "Not Found" "text/plain; charset=utf-8" ([System.Text.Encoding]::UTF8.GetBytes("Not Found"))
      }
    } catch {
      # ignore a single bad connection and keep serving
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
