#!/bin/bash
set -e

# Command line arguments
ARGS=("$@")
PACKAGE_NAME="${ARGS[0]}"

# Other constants
NPM_SCOPE="@x3r5e/"

echo $( npm view "$NPM_SCOPE""$PACKAGE_NAME" version)
