#!/bin/bash
set -e

# Command line arguments
ARGS=("$@")
PACKAGE_NAME="${ARGS[0]}"

echo $( jq -r .version ./packages/"$PACKAGE_NAME"/package.json )
