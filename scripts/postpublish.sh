#!/bin/bash
set -e

args=("$@")
packageName=${args[0]}

cat ./package.json

packageArr=($(jq -r .name,.version ./packages/"$packageName"/package.json))
packageNameAndVersion="${packageArr[0]}@${packageArr[1]}"

changedFiles=$( git add ./packages/"$packageName"/package.json ./packages/"$packageName"/package-lock.json --dry-run )

if [[ "$changedFiles" ]]
then
    git add ./packages/"$packageName"/package.json ./packages/"$packageName"/package-lock.json
fi

git tag -a "$packageNameAndVersion" -m "$packageNameAndVersion"
