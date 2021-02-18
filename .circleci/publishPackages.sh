#!/bin/bash
set -e

args=("$@")
npm_token=${args[0]}

# Command line output formats
CYAN_BRIGHT='\033[0;96m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BOLD='\033[1m'
END='\e[0m'

# If the commit has a package publish tag, this script does not need to run
tagsAssociatedWithCommit=$( git tag --points-at HEAD )
if [[ ! -z $( echo $tagsAssociatedWithCommit | grep "^@x3r5e\/.*@.*" ) ]]
then
    printf "${GREEN}This commit is associated with a package publish tag: $tagsAssociatedWithCommit. This script will be skipped.\n${END}"
    exit 0
fi

# Returns an array of JSON objects, where each object is of the following shape:
# { name: package-name-without-scope, localVersion: version-from-package-json, publishedVersion: version-on-npm@latest }

packageNames=($( ls ./packages ))
packageNamesWithVersions=()

for packageName in "${packageNames[@]}"
do
    name=$packageName
    localVersion=$( jq -r .version ./packages/$name/package.json )
    publishedVersion=$( npm view @x3r5e/$name version)

    packageNamesWithVersions+=($( jq -nc \
                                --arg name "${name}" \
                                --arg localVersion "${localVersion}" \
                                --arg publishedVersion "${publishedVersion}" \
                                '{name: $name, localVersion: $localVersion, publishedVersion: $publishedVersion}' ) )
done

# Accepts an array of package version JSON objects, where each object is of the following shape:
# { name: package-name-without-scope, localVersion: version-from-package-json, publishedVersion: version-on-npm@latest }
# Returns an array of package names that need to be published
packageNamesToPublish=()

for packageNameWithVersions in "${packageNamesWithVersions[@]}"
do        
    localVersion=$( jq -r .localVersion <<< $packageNameWithVersions)
    publishedVersion=$( jq -r .publishedVersion <<< $packageNameWithVersions )

    if [ $localVersion != $publishedVersion ]
    then
        name=$( jq -r .name <<< $packageNameWithVersions )
        packageNamesToPublish+=($name)
    fi
done

# Publish the packages

# If none of the packages have had their version changed, skip publishing
if [[ -z "${packageNamesToPublish[@]}" ]]
then
    printf "${GREEN}None of the packages have had their version change. Skipping publish.\n${END}"
    exit 0
fi

if [[ "${packageNamesToPublish[@]}" =~ "design-tokens" ]]
then
        printf "\n\n${CYAN_BRIGHT}======== PUBLISHING @x3r5e/design-tokens ========\n${END}"
        cd ./packages/design-tokens
        echo "//registry.npmjs.org/:_authToken=$npm_token" > .npmrc
        npm ci
        npm publish
        cd ../..
        printf "${GREEN}======== @x3r5e/design-tokens PUBLISHED ========\n\n${END}"
fi

if [[ "${packageNamesToPublish[@]}" =~ "icons" ]]
then
        printf "\n\n${CYAN_BRIGHT}======== PUBLISHING @x3r5e/icons ========\n${END}"
        cd ./packages/icons
        echo "//registry.npmjs.org/:_authToken=$npm_token" > .npmrc
        npm ci
        npm publish
        cd ../..
        printf "${GREEN}======== @x3r5e/icons PUBLISHED ========\n\n${END}"
fi

# Waits for new package versions to become available
sleep 2m

if [[ "${packageNamesToPublish[@]}" =~ "component-styles" ]]
then
    # Does not publish @x3r5e/component-styles if the latest version @x3r5e/design-tokens is not yet available
    isPackageVersionNotAvailable=false

    for packageNameWithVersions2 in "${packageNamesWithVersions[@]}"
    do  
        name2=$( jq -r .name <<< $packageNameWithVersions2 )

        if [ "$name2" = "design-tokens" ]
        then
            localVersion2=$( jq -r .localVersion <<< $packageNameWithVersions2)
            publishedVersion2=$( npm view @x3r5e/$name2 version )

            if [ $localVersion2 != $publishedVersion2 ]
            then
                isPackageVersionNotAvailable=true
                printf "${RED}Skipping publish of ${BOLD}@x3r5e/component-styles${END}${RED} and ${BOLD}@x3r5e/react-components${END}${RED} because the latest version of ${BOLD}@x3r5e/$name2${END}${RED} is not yet available. After this build completes, pull the latest changes from the main branch, create a new MR, and wait for the latest version of @x3r5e/$name2 to become available using the command ${BOLD}'npm view @x3r5e/$name2 version'${END}${RED}. Then, create merge the MR to publish.\n${END}"
            fi
        fi
    done

    if [ "$isPackageVersionNotAvailable" = true ]
    then
        exit 1
    fi

    # Publishes @x3r5e/component-styles
    printf "\n\n${CYAN_BRIGHT}======== PUBLISHING @x3r5e/component-styles ========\n${END}"
    cd ./packages/component-styles
    echo "//registry.npmjs.org/:_authToken=$npm_token" > .npmrc
    npm ci
    npm install --save-exact @x3r5e/design-tokens@latest
    npm publish
    cd ../..
    printf "${GREEN}======== @x3r5e/component-styles PUBLISHED ========\n\n${END}"
fi

# Waits for new package versions to become available
sleep 2m

if [[ "${packageNamesToPublish[@]}" =~ "react-components" ]]
then
    # Does not publish @x3r5e/react-components if the latest version of @x3r5e/icons or @x3r5e/component-styles is not yet available
    isPackageVersionNotAvailable2=false

    for packageNameWithVersions3 in "${packageNamesWithVersions[@]}"
    do  
        name3=$( jq -r .name <<< $packageNameWithVersions3 )

        if [ "$name3" = "icons" || "$name3" = "component-styles" ]
        then
            localVersion3=$( jq -r .localVersion <<< $packageNameWithVersions3)
            publishedVersion3=$( npm view @x3r5e/$name3 version )

            if [ $localVersion3 != $publishedVersion3 ]
            then
                isPackageVersionNotAvailable3=true
                printf "${RED}Skipping publish of ${BOLD}@x3r5e/component-styles${END}${RED} and ${BOLD}@x3r5e/react-components${END}${RED} because the latest version of ${BOLD}@x3r5e/$name3${END}${RED} is not yet available. After this build completes, pull the latest changes from the main branch, create a new MR, and wait for the latest version of @x3r5e/$name3 to become available using the command ${BOLD}'npm view @x3r5e/$name3 version'${END}${RED}. Then, create merge the MR to publish.\n${END}"
            fi
        fi
    done

    if [ "$isPackageVersionNotAvailable2" = true ]
    then
        exit 1
    fi

    # Publishes @x3r5e/react-components
    printf "\n\n${CYAN_BRIGHT}======== PUBLISHING @x3r5e/react-components ========\n${END}"
    cd ./packages/react-components
    echo "//registry.npmjs.org/:_authToken=$npm_token" > .npmrc
    npm ci
    npm install --save-exact @x3r5e/icons@latest @x3r5e/component-styles@latest
    npm publish
    cd ../..
    printf "${GREEN}======== @x3r5e/react-components PUBLISHED ========\n\n${END}"
fi
