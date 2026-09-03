#!/usr/bin/env bash
# ZERO cekirdek MVP - adim 2: derle + calistir.
# ~/zero-build/firefox-esr icinden calistir. Ilk derleme 1-3 saat surer.
set -euo pipefail
cd ~/zero-build/firefox-esr
./mach bootstrap --no-interactive --application-choice browser 2>/dev/null || true
./mach build
echo "=== derleme bitti, calistiriliyor ==="
./mach run --profile /tmp/zero-profile
