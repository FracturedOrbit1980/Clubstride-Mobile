$root = "C:\Users\Robert.Delport\.gemini\antigravity\scratch\Clubstride Mobile-app"
$patterns = @(
    @{Old='Clubstride Mobile'; New='Clubstride Mobile'},
    @{Old='Clubstride Mobile'; New='Clubstride Mobile'}
)
Get-ChildItem -Path $root -Recurse -File -Include *.html,*.js,*.json,*.md,*.ps1,*.py | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    foreach ($p in $patterns) {
        $content = $content -replace [regex]::Escape($p.Old), $p.New
    }
    Set-Content -Path $_.FullName -Value $content -Encoding UTF8
}

