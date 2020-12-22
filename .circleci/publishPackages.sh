#!/bin/bash
set -e

# Command line output formats
GREEN='\033[0;32m'
BOLD='\033[1m'
END='\e[0m'

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

# If none of the packages have had their version changed, skip publishing
if [ -z "$packageNamesToPublish" ]
then
    printf "${GREEN}None of the packages have had their version change. Skipping publish.\n${END}"
    exit 0
fi

if [[ "${packageNamesToPublish[@]}" =~ "design-tokens" ]]
then
        cd ./packages/design-tokens
        npm ci
        npm publish --dry-run
        cd ../..
fi

if [[ "${packageNamesToPublish[@]}" =~ "icons" ]]
then
        cd ./packages/icons
        npm ci
        npm publish --dry-run
        cd ../..
fi

if [[ "${packageNamesToPublish[@]}" =~ "component-styles" ]]
then
        cd ./packages/component-styles
        npm ci
        npm install --save-dev @x3r5e/design-tokens@latest
        npm publish --dry-run
        cd ../..
fi

if [[ "${packageNamesToPublish[@]}" =~ "react-components" ]]
then
        cd ./packages/react-components
        npm ci
        npm install --save @x3r5e/icons@latest
        npm install --save @x3r5e/component-styles@latest
        npm publish --dry-run
        cd ../..
fi
