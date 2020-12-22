#!/bin/bash
set -e

packageArr=($(jq -r .name,.version ./package.json))
packageNameAndVersion="${packageArr[0]}@${packageArr[1]}"

echo "Turn on git commits for ${packageNameAndVersion} when ready"

# git add package.json package-lock.json
# git commit -m "Publish $packageNameAndVersion"
# git tag -a $packageNameAndVersion -m "$packageNameAndVersion"
# git push --follow-tags
