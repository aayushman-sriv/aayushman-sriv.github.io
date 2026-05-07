param(
  [int]$Port = 5500
)

function Get-MimeType {
  param([string]$Extension)

  switch ($Extension.ToLowerInvariant()) {
    ".html" { "text/html; charset=utf-8"; break }
    ".css" { "text/css; charset=utf-8"; break }
    ".js" { "text/javascript; charset=utf-8"; break }
    ".json" { "application/json; charset=utf-8"; break }
    ".glb" { "model/gltf-binary"; break }
    ".gltf" { "model/gltf+json"; break }
    ".bin" { "application/octet-stream"; break }
    ".png" { "image/png"; break }
    ".jpg" { "image/jpeg"; break }
    ".jpeg" { "image/jpeg"; break }
    ".webp" { "image/webp"; break }
    ".svg" { "image/svg+xml"; break }
    ".pdf" { "application/pdf"; break }
    default { "application/octet-stream" }
  }
}

function Send-Response {
  param(
    [System.IO.Stream]$Stream,
    [int]$StatusCode,
    [string]$StatusText,
    [string]$ContentType,
    [byte[]]$Body,
    [bool]$SendBody = $true
  )

  $headers = "HTTP/1.1 $StatusCode $StatusText`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
  $headerBytes = [System.Text.Encoding]::ASCII.GetBytes($headers)
  $Stream.Write($headerBytes, 0, $headerBytes.Length)

  if ($SendBody -and $Body.Length -gt 0) {
    $Stream.Write($Body, 0, $Body.Length)
  }
}

function Get-RequestPath {
  param([string]$RequestLine)

  $parts = $RequestLine.Split(" ")
  if ($parts.Count -lt 2) {
    return ""
  }

  $rawPath = $parts[1].Split("?")[0].TrimStart("/")
  if ([string]::IsNullOrWhiteSpace($rawPath)) {
    return "index.html"
  }

  return [System.Uri]::UnescapeDataString($rawPath)
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$resolvedRoot = (Resolve-Path -LiteralPath $root).Path
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()

Write-Host "Serving $resolvedRoot at http://localhost:$Port/"

try {
  while ($true) {
    $client = $listener.AcceptTcpClient()

    try {
      $stream = $client.GetStream()
      $reader = [System.IO.StreamReader]::new($stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
      $requestLine = $reader.ReadLine()

      while ($true) {
        $line = $reader.ReadLine()
        if ($null -eq $line -or $line -eq "") {
          break
        }
      }

      if ([string]::IsNullOrWhiteSpace($requestLine)) {
        $body = [System.Text.Encoding]::UTF8.GetBytes("400 Bad Request")
        Send-Response $stream 400 "Bad Request" "text/plain; charset=utf-8" $body
        continue
      }

      $method = $requestLine.Split(" ")[0]
      if ($method -ne "GET" -and $method -ne "HEAD") {
        $body = [System.Text.Encoding]::UTF8.GetBytes("405 Method Not Allowed")
        Send-Response $stream 405 "Method Not Allowed" "text/plain; charset=utf-8" $body
        continue
      }

      $relativePath = Get-RequestPath $requestLine
      $candidate = Join-Path $resolvedRoot $relativePath

      if (Test-Path -LiteralPath $candidate -PathType Container) {
        $candidate = Join-Path $candidate "index.html"
      }

      if (Test-Path -LiteralPath $candidate -PathType Leaf) {
        $resolvedFile = (Resolve-Path -LiteralPath $candidate).Path

        if (-not $resolvedFile.StartsWith($resolvedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
          $body = [System.Text.Encoding]::UTF8.GetBytes("403 Forbidden")
          Send-Response $stream 403 "Forbidden" "text/plain; charset=utf-8" $body ($method -ne "HEAD")
        } else {
          $body = [System.IO.File]::ReadAllBytes($resolvedFile)
          $contentType = Get-MimeType ([System.IO.Path]::GetExtension($resolvedFile))
          Send-Response $stream 200 "OK" $contentType $body ($method -ne "HEAD")
        }
      } else {
        $body = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        Send-Response $stream 404 "Not Found" "text/plain; charset=utf-8" $body ($method -ne "HEAD")
      }
    } catch {
      Write-Warning "Skipped request after a client connection error: $($_.Exception.Message)"
    } finally {
      $client.Close()
    }
  }
} finally {
  $listener.Stop()
}
