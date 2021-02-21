#!/bin/bash
set -e

args=("$@")
packageName=${args[0]}

# Command line output formats
CYAN_BRIGHT='\033[0;96m'
GREEN='\033[0;32m'
END='\e[0m'

function getLocalPackageVersion() {
    local packageName="$1"

    echo $( jq -r .version ./packages/"$packageName"/package.json )
}

function getPublishedPackageVersionLatest() {
    local packageName="$1"

    echo $( npm view @x3r5e/$packageName version)
}

function isLocalPackageVersionDifferentThanPublishedVersion() {
    local packageName="$1"

    local localVersion=$( getLocalPackageVersion "$packageName" )
    local publishedVersion=$( getPublishedPackageVersionLatest "$packageName" )

    if [[ $localVersion != $publishedVersion ]]
    then
        echo "true"
    else
        echo "false"
    fi
}

# Link appropriate package dependencies for testing. Each dependency will only be linked if the dependency has a local version that is different than the published version (@latest).
if [[ $packageName = "component-styles" ]]
then
    if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "design-tokens" ) = "true"  ]]
    then
        printf "\n\n${CYAN_BRIGHT}======== LINKING @x3r5e/design-tokens ========\n${END}"

        npm link ../design-tokens

        printf "${GREEN}======== @x3r5e/design-tokens LINKED ========\n\n${END}"
    else
        printf "\n\n${CYAN_BRIGHT}======== @x3r5e/design-tokens WAS NOT LINKED ========\n${END}"
    fi
elif [[ $packageName = "react-components" ]]
then
    if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "icons" ) = "true"  ]]
    then
        printf "\n\n${CYAN_BRIGHT}======== LINKING @x3r5e/icons ========\n${END}"

        npm link ../icons

        printf "${GREEN}======== @x3r5e/icons LINKED ========\n\n${END}"
    else
        printf "\n\n${CYAN_BRIGHT}======== @x3r5e/icons WAS NOT LINKED ========\n${END}"
    fi

    if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "component-styles" ) = "true"  ]]
    then
        printf "\n\n${CYAN_BRIGHT}======== LINKING @x3r5e/component-styles ========\n${END}"

        npm link ../component-styles

        printf "${GREEN}======== @x3r5e/component-styles LINKED ========\n\n${END}"
    else
        printf "\n\n${CYAN_BRIGHT}======== @x3r5e/component-styles WAS NOT LINKED ========\n${END}"
    fi
fi
