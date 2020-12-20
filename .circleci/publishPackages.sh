#!/bin/bash
set -e

getPackageVersions () {
    local packageNames=(`ls ./packages`)
    local packageVersions=()

    for i in "${packageNames[@]}"
    do
        local name=$i
        local localVersion=$( jq -r .version ./packages/$name/package.json )
        local publishedVersion=$( npm view @x3r5e/$name version)

        packageVersions+=($( jq -nc \
                                 --arg name "${name}" \
                                 --arg localVersion "${localVersion}" \
                                 --arg publishedVersion "${publishedVersion}" \
                                 '{name: $name, localVersion: $localVersion, publishedVersion: $publishedVersion}' ) )
    done

    echo ${packageVersions[@]}
}

getPackagesToPublish () {
    local packageVersions=("$@")
    local packagesToPublish=()

    for i in "${packageVersions[@]}"
    do        
        local localVersion=$( jq -r .localVersion <<< $i)
        local publishedVersion=$( jq -r .publishedVersion <<< $i )

        if [ $localVersion != $publishedVersion ]
        then
            local name=$( jq -r .name <<< $i )
            packagesToPublish+=($name)
        fi
    done

    echo ${packagesToPublish[@]}
}

packageVersions=($(getPackageVersions))
packagesToPublish=($(getPackagesToPublish "${packageVersions[@]}"))

for packageName in ${packagesToPublish[@]}
do
    echo Turn on publishing when ready
    # npm publish --dry-run ../packages/$packageName
done
