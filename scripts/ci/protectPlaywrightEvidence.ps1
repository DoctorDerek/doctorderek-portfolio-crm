param(
    [string[]] $ReportDirectories = @('playwright-report', 'test-results'),
    [string] $OutputFile = $env:PLAYWRIGHT_OUTPUT_FILE
)

$ErrorActionPreference = 'Stop'
$token = $env:PLAYWRIGHT_VERCEL_TRUSTED_OIDC_TOKEN
$encoding = [System.Text.Encoding]::Latin1

function Protect-Archive([byte[]] $Bytes) {
    $memory = [System.IO.MemoryStream]::new()
    try {
        $memory.Write($Bytes, 0, $Bytes.Length)
        $memory.Position = 0
        $archive = [System.IO.Compression.ZipArchive]::new($memory, 'Update', $true)
        try {
            foreach ($entry in $archive.Entries) {
                if ($entry.Name -eq '') { continue }
                $entryStream = $entry.Open()
                $entryBytes = [System.IO.MemoryStream]::new()
                try {
                    $entryStream.CopyTo($entryBytes)
                    $original = $encoding.GetString($entryBytes.ToArray())
                    $redacted = $original.Replace($token, '[REDACTED]')
                    if ($original -cne $redacted) {
                        $replacement = $encoding.GetBytes($redacted)
                        $entryStream.Position = 0
                        $entryStream.SetLength(0)
                        $entryStream.Write($replacement, 0, $replacement.Length)
                    }
                }
                finally {
                    $entryBytes.Dispose()
                    $entryStream.Dispose()
                }
            }
        }
        finally { $archive.Dispose() }
        return ,$memory.ToArray()
    }
    finally { $memory.Dispose() }
}

$files = @(
    foreach ($directory in $ReportDirectories) {
        if (Test-Path -LiteralPath $directory) {
            Get-ChildItem -LiteralPath $directory -Recurse -File -Force
        }
    }
    if ($OutputFile -and (Test-Path -LiteralPath $OutputFile)) {
        Get-Item -LiteralPath $OutputFile
    }
)

if ($files.Count -gt 0 -and [string]::IsNullOrWhiteSpace($token)) {
    throw 'The Preview token is unavailable; authenticated evidence cannot be safely published.'
}

foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    if ($file.Extension -eq '.zip') {
        [System.IO.File]::WriteAllBytes($file.FullName, (Protect-Archive $bytes))
        continue
    }
    $original = $encoding.GetString($bytes)
    $redacted = $original.Replace($token, '[REDACTED]')
    if ($file.Extension -eq '.html') {
        $redacted = [regex]::Replace($redacted, '(?<=data:application/zip;base64,)[A-Za-z0-9+/=]+', {
            param($match)
            [Convert]::ToBase64String((Protect-Archive ([Convert]::FromBase64String($match.Value))))
        })
    }
    if ($original -cne $redacted) {
        [System.IO.File]::WriteAllBytes($file.FullName, $encoding.GetBytes($redacted))
    }
}
