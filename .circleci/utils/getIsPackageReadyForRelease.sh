#!/bin/bash
set -e

# Command line arguments
ARGS=("$@")
PACKAGE_NAME="${ARGS[0]}"
IS_CUSTOM_RELEASE="${ARGS[1]}"

if [[ "$IS_CUSTOM_RELEASE" = true ]]
then
    chmod u+x ./.circleci/utils/getIsPackageLocalVersionDifferentThanLatestVersion.sh
    echo $( ./.circleci/utils/getIsPackageLocalVersionDifferentThanLatestVersion.sh "$PACKAGE_NAME" )
else
    chmod u+x ./.circleci/utils/getIsPackageLocalVersionGreaterThanLatestVersion.sh
    echo $( ./.circleci/utils/getIsPackageLocalVersionGreaterThanLatestVersion.sh "$PACKAGE_NAME" )
fi

