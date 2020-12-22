#!/bin/bash
set -e

# Returns an array of JSON objects, where each object is of the following shape:
# { name: package-name-without-scope, localVersion: version-from-package-json, publishedVersion: version-on-npm@latest }
getPackageVersions () {
    local packageNames=($( ls ./packages ))
    local packageVersions=()

    for packageName in "${packageNames[@]}"
    do
        local name=$packageName
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

# Accepts an array of package version JSON objects, where each object is of the following shape:
# { name: package-name-without-scope, localVersion: version-from-package-json, publishedVersion: version-on-npm@latest }
# Returns an array of package names that need to be published
getPackageNamesToPublish () {
    local packageVersions=("$@")
    local packagesToPublish=()

    for packageVersion in "${packageVersions[@]}"
    do        
        local localVersion=$( jq -r .localVersion <<< $packageVersion)
        local publishedVersion=$( jq -r .publishedVersion <<< $packageVersion )

        if [ $localVersion != $publishedVersion ]
        then
            local name=$( jq -r .name <<< $packageVersion )
            packagesToPublish+=($name)
        fi
    done

    echo ${packagesToPublish[@]}
}

packageVersions=($( getPackageVersions ))
packageNamesToPublish=($( getPackageNamesToPublish "${packageVersions[@]}" ))

for packageName in ${packageNamesToPublish[@]}
do
    echo Turn on publishing when ready
    # npm publish --dry-run ../packages/$packageName
done
