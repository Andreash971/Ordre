# Generate a self-signed Windows code signing certificate using PowerShell.
# Run once, on a Windows machine, in an elevated PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\scripts\generate-signing-cert.ps1
#
# Outputs into .\certs\ :
#   bib-ordre-signing.cer  (public cert - import on target Windows PCs into Trusted Root)
#   bib-ordre-signing.pfx  (PKCS#12 bundle - what electron-forge consumes via WIN_CSC_LINK)

$ErrorActionPreference = 'Stop'

$CN      = if ($env:CERT_CN)      { $env:CERT_CN }      else { 'Andreas Henriksen' }
$Org     = if ($env:CERT_ORG)     { $env:CERT_ORG }     else { 'Blomster i Byhaven' }
$Country = if ($env:CERT_COUNTRY) { $env:CERT_COUNTRY } else { 'NO' }
$Years   = if ($env:CERT_YEARS)   { [int]$env:CERT_YEARS } else { 10 }

$repoRoot = Split-Path -Parent $PSScriptRoot
$certDir  = Join-Path $repoRoot 'certs'
New-Item -ItemType Directory -Force -Path $certDir | Out-Null

$pfxPath = Join-Path $certDir 'bib-ordre-signing.pfx'
$cerPath = Join-Path $certDir 'bib-ordre-signing.cer'

if (Test-Path $pfxPath) {
    Write-Error "Refusing to overwrite existing $pfxPath - delete it manually if you really want to regenerate."
    exit 1
}

Write-Host "Generating $Years-year self-signed code-signing cert for CN='$CN'..."

$certParams = @{
    Subject            = "CN=$CN, O=$Org, C=$Country"
    Type               = 'CodeSigningCert'
    KeyAlgorithm       = 'RSA'
    KeyLength          = 4096
    HashAlgorithm      = 'SHA256'
    KeyUsage           = 'DigitalSignature'
    TextExtension      = @('2.5.29.37={text}1.3.6.1.5.5.7.3.3')
    CertStoreLocation  = 'Cert:\CurrentUser\My'
    NotAfter           = (Get-Date).AddYears($Years)
}
$cert = New-SelfSignedCertificate @certParams

$pw = Read-Host -AsSecureString 'Choose a password for the .pfx (you will set this as WIN_CSC_KEY_PASSWORD)'

Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $pw | Out-Null
Export-Certificate    -Cert $cert -FilePath $cerPath -Type CERT  | Out-Null

# Remove the cert from the user store - keep it only in the .pfx file
Remove-Item -Path "Cert:\CurrentUser\My\$($cert.Thumbprint)" -Force

Write-Host ''
Write-Host "Done. Files written to: $certDir"
Write-Host '  bib-ordre-signing.pfx  <- point WIN_CSC_LINK at this'
Write-Host '  bib-ordre-signing.cer  <- distribute to shop PCs and import into Trusted Root Certification Authorities'
Write-Host ''
Write-Host 'Next, in this PowerShell session:'
Write-Host ('  $env:WIN_CSC_LINK = ' + [char]34 + $pfxPath + [char]34)
Write-Host ('  $env:WIN_CSC_KEY_PASSWORD = ' + [char]34 + '<the password you just chose>' + [char]34)
Write-Host '  npm run make'
Write-Host ''
Write-Host 'Keep the .pfx secret. It is gitignored, but back it up somewhere safe (e.g. a password manager).'
