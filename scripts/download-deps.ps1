# Download required jars into src/main/webapp/WEB-INF/lib
$target = "src/main/webapp/WEB-INF/lib"
if (-not (Test-Path $target)) { New-Item -ItemType Directory -Path $target -Force | Out-Null }

$files = @(
    @{url="https://repo1.maven.org/maven2/org/mindrot/jbcrypt/0.4/jbcrypt-0.4.jar"; name="jbcrypt-0.4.jar"},
    @{url="https://repo1.maven.org/maven2/com/sun/mail/jakarta.mail/1.6.7/jakarta.mail-1.6.7.jar"; name="jakarta.mail-1.6.7.jar"},
    @{url="https://repo1.maven.org/maven2/jakarta/activation/jakarta.activation-api/1.2.2/jakarta.activation-api-1.2.2.jar"; name="jakarta.activation-api-1.2.2.jar"}
)

foreach ($f in $files) {
    $dest = Join-Path $target $f.name
    if (-not (Test-Path $dest)) {
        Write-Host "Downloading $($f.url) -> $dest"
        Invoke-WebRequest -Uri $f.url -OutFile $dest
    } else {
        Write-Host "Already exists: $dest"
    }
}

Write-Host "Done. Place these jars into your deployed WEB-INF/lib if necessary and restart Tomcat."