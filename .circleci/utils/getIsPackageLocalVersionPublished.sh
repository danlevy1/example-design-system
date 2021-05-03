#!/bin/bash
set -e

# Command line arguments
ARGS=("$@")
PACKAGE_NAME="${ARGS[0]}"

chmod u+x ./.circleci/utils/getLocalPackageVersion
chmod u+x ./.circleci/utils/getLatestPackageVersion

localVersion=$( ./.circleci/utils/getLocalPackageVersion.sh "$PACKAGE_NAME" )
latestVersion=$( ./.circleci/utils/getLatestPackageVersion.sh "$PACKAGE_NAME" )

if [[ $localVersion = $latestVersion ]]
then
    echo "true"
else
    echo "false"
fi
