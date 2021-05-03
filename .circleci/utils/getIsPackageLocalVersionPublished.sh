#!/bin/bash
set -e

# Command line arguments
ARGS=("$@")
PACKAGE_NAME="${ARGS[0]}"

chmod u+x ./utils/getLocalPackageVersion
chmod u+x ./utils/getLatestPackageVersion

localVersion=$( ./utils/getLocalPackageVersion.sh "$PACKAGE_NAME" )
latestVersion=$( ./utils/getLatestPackageVersion.sh "$PACKAGE_NAME" )

if [[ $localVersion = $latestVersion ]]
then
    echo "true"
else
    echo "false"
fi
