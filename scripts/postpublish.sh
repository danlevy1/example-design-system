#!/bin/bash
set -e

packageArr=($(jq -r .name,.version ./package.json))
packageNameAndVersion="${packageArr[0]}@${packageArr[1]}"

changedFiles=$( git add package.json package-lock.json --dry-run )

if [[ "$changedFiles" ]]
then
    git add package.json package-lock.json
    git commit -m "Publish $packageNameAndVersion"
fi

git tag -a "$packageNameAndVersion" -m "$packageNameAndVersion"
git push --follow-tags
