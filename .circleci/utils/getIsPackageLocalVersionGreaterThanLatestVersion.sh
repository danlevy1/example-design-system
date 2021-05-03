#!/bin/bash
set -e

# Command line arguments
ARGS=("$@")
PACKAGE_NAME="${ARGS[0]}"

chmod u+x ./.circleci/utils/getLocalPackageVersion.sh
chmod u+x ./.circleci/utils/getLatestPackageVersion.sh

localVersion=$( ./.circleci/utils/getLocalPackageVersion.sh "$PACKAGE_NAME" )
latestVersion=$( ./.circleci/utils/getLatestPackageVersion.sh "$PACKAGE_NAME" )

IFS='.' read -ra localVersionSplit <<< "$localVersion"
IFS='.' read -ra latestVersionSplit <<< "$latestVersion"

isPackageLocalVersionGreaterThanLatestVersion="false";

for versionNumberIndex in {0..2}
do
    localVersionNumber="${localVersionSplit[versionNumberIndex]}"
    latestVersionNumber="${latestVersionSplit[versionNumberIndex]}"

    if [[ "$localVersionNumber" -gt "$latestVersionNumber" ]]
    then
        isPackageLocalVersionGreaterThanLatestVersion="true";
        break;
    elif [[ "$localVersionNumber" -lt "$latestVersionNumber" ]]
    then
        break;
    fi
done

echo "$isPackageLocalVersionGreaterThanLatestVersion"
