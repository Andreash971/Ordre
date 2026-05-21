#!/usr/bin/env bash
# Generate a self-signed Windows code signing certificate using OpenSSL.
# Run once. Outputs into ./certs/ :
#   bib-ordre-signing.key  (private key)
#   bib-ordre-signing.crt  (public cert, PEM)
#   bib-ordre-signing.cer  (public cert, DER — what you import on target Windows PCs)
#   bib-ordre-signing.pfx  (PKCS#12 bundle — what electron-forge consumes via WIN_CSC_LINK)
#
# After running, set in your shell or .env.local (do NOT commit):
#   export WIN_CSC_LINK="$(pwd)/certs/bib-ordre-signing.pfx"
#   export WIN_CSC_KEY_PASSWORD="<the password you chose below>"
#
# Then `npm run make` will produce a signed installer.

set -euo pipefail

CERT_DIR="$(cd "$(dirname "$0")/.." && pwd)/certs"
mkdir -p "$CERT_DIR"

# Set CERT_CN and CERT_ORG before running for a real cert; defaults are placeholders only.
CN="${CERT_CN:-Your Name}"
ORG="${CERT_ORG:-Your Organisation}"
COUNTRY="${CERT_COUNTRY:-NO}"
DAYS="${CERT_DAYS:-3650}"  # ~10 years

KEY="$CERT_DIR/bib-ordre-signing.key"
CRT="$CERT_DIR/bib-ordre-signing.crt"
CER="$CERT_DIR/bib-ordre-signing.cer"
PFX="$CERT_DIR/bib-ordre-signing.pfx"
CFG="$CERT_DIR/openssl-codesign.cnf"

if [[ -f "$PFX" ]]; then
  echo "Refusing to overwrite existing $PFX — delete it manually if you really want to regenerate." >&2
  exit 1
fi

cat > "$CFG" <<EOF
[ req ]
distinguished_name = dn
prompt = no
x509_extensions = v3_codesign

[ dn ]
CN = ${CN}
O  = ${ORG}
C  = ${COUNTRY}

[ v3_codesign ]
basicConstraints = critical, CA:FALSE
keyUsage = critical, digitalSignature
extendedKeyUsage = critical, codeSigning
subjectKeyIdentifier = hash
EOF

echo "Generating ${DAYS}-day self-signed code-signing cert for CN='${CN}'..."
openssl req -x509 -newkey rsa:4096 -sha256 -days "$DAYS" -nodes \
  -keyout "$KEY" -out "$CRT" -config "$CFG"

openssl x509 -in "$CRT" -outform DER -out "$CER"

echo
read -r -s -p "Choose a password for the .pfx (you'll set this as WIN_CSC_KEY_PASSWORD): " PFX_PW
echo
read -r -s -p "Confirm password: " PFX_PW2
echo
if [[ "$PFX_PW" != "$PFX_PW2" ]]; then
  echo "Passwords don't match — aborting." >&2
  exit 1
fi

openssl pkcs12 -export \
  -inkey "$KEY" -in "$CRT" \
  -name "BiB Ordre Code Signing" \
  -out "$PFX" \
  -passout "pass:$PFX_PW"

chmod 600 "$KEY" "$PFX"
rm -f "$CFG"

cat <<EOF

Done. Files written to: $CERT_DIR
  bib-ordre-signing.pfx  <- WIN_CSC_LINK points to this
  bib-ordre-signing.cer  <- distribute this to shop PCs and import into 'Trusted Root Certification Authorities'

Next:
  export WIN_CSC_LINK="$PFX"
  export WIN_CSC_KEY_PASSWORD="<the password you just chose>"
  npm run make

Keep the .pfx and .key secret. They are gitignored, but back them up somewhere safe
(e.g. a password manager) — if lost, you'll need to mint a new cert and re-import on every PC.
EOF
