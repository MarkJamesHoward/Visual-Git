#!/bin/bash
# Wrapper script to launch Visual Git with --no-sandbox on Linux
# Required for Ubuntu 24.04+ due to AppArmor restrictions

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
exec "$SCRIPT_DIR/visual-git-electron.bin" --no-sandbox "$@"
