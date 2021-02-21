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

function sleepBetweenPublishCommands() {
    printf "\n\n${CYAN_BRIGHT}======== SLEEPING FOR THREE MINUTES ========\n${END}"

    sleep 180

    printf "\n\n${CYAN_BRIGHT}======== THREE MINUTE SLEEP HAS ENDED ========\n${END}"
}

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

function beginPackagePublish() {
    local packageName="$1"

    printf "\n\n${CYAN_BRIGHT}======== PUBLISHING @x3r5e/"$packageName" ========\n${END}"

    cd ./packages/"$packageName"
    npm ci
}

function endSuccessfulPackagePublish() {
    local packageName="$1"

    cd ../..

    printf "${GREEN}======== @x3r5e/"$packageName" PUBLISHED ========\n\n${END}"
}

function publishDesignTokensPackage() {
    local packageName="design-tokens"

    beginPackagePublish "$packageName"
    
    npm publish

    endSuccessfulPackagePublish "$packageName"
}

function publishIconsPackage() {
    local packageName="icons"

    beginPackagePublish "$packageName"
    
    npm publish
    
    endSuccessfulPackagePublish "$packageName"
}

function publishComponentStylesPackage() {
    local packageName="component-styles"

    beginPackagePublish "$packageName"
        
    npm install --save-exact @x3r5e/design-tokens@latest
    npm publish
    
    endSuccessfulPackagePublish "$packageName"
}

function publishReactComponentsPackage() {
    local packageName="react-components"

    beginPackagePublish "$packageName"
    
    npm install --save-exact @x3r5e/icons@latest @x3r5e/component-styles@latest
    npm publish
    
    endSuccessfulPackagePublish "$packageName"
}

# ==== BEGIN SCRIPT ====

# Writes the npm token to the npmrc file
echo "//registry.npmjs.org/:_authToken=$npm_token" > .npmrc

# Publishes the design-tokens package
isDesignTokensLocalPackageVersionDifferentThanPublishedVersion=false;

if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "design-tokens" ) = "true" ]]
then
    isDesignTokensLocalPackageVersionDifferentThanPublishedVersion = true;
    publishDesignTokensPackage
fi

# Publishes the icons package
isIconsLocalPackageVersionDifferentThanPublishedVersion=false;

if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "icons" ) = "true" ]]
then
    isIconsLocalPackageVersionDifferentThanPublishedVersion=true;
    publishIconsPackage
fi

# Publishes the component-styles package if the latest version of the design-tokens package is available
isComponentStylesLocalPackageVersionDifferentThanPublishedVersion=false;

if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "component-styles" ) = "true" ]]
then
    isComponentStylesLocalPackageVersionDifferentThanPublishedVersion=true;

    if [[ isDesignTokensLocalPackageVersionDifferentThanPublishedVersion = true ]]
    then
        sleepBetweenPublishCommands
    fi

    if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "design-tokens" ) = "true" ]]
    then
        printf "${RED}Skipping publish of ${BOLD}@x3r5e/component-styles${END}${RED} and ${BOLD}@x3r5e/react-components${END}${RED} because the latest version of ${BOLD}@x3r5e/design-tokens${END}${RED} is not yet available. After this build completes, pull the latest changes from the main branch and wait for the latest version of @x3r5e/design-tokens to become available using the command ${BOLD}'npm view @x3r5e/design-tokens version'${END}${RED}. When the latest version of @x3r5e/design-tokens becomes available, push an empty commit to the main branch to trigger this job again.\n${END}"
        exit 1
    else
        publishComponentStylesPackage
    fi
fi

# Publishes the react-components package if the latest version of the icons package and component-styles package is available
isReactComponentsLocalPackageVersionDifferentThanPublishedVersion=false;

if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "react-components" ) = "true" ]]
then
    isReactComponentsLocalPackageVersionDifferentThanPublishedVersion=true;

    if [[ isIconsLocalPackageVersionDifferentThanPublishedVersion = true && isComponentStylesLocalPackageVersionDifferentThanPublishedVersion = true ]]
    then
        sleepBetweenPublishCommands
    fi

    if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "icons" ) = "true"  ]]
    then
        printf "${RED}Skipping publish of ${BOLD}@x3r5e/react-components${END}${RED} because the latest version of ${BOLD}@x3r5e/icons${END}${RED} is not yet available. After this build completes, pull the latest changes from the main branch and wait for the latest version of @x3r5e/icons to become available using the command ${BOLD}'npm view @x3r5e/icons version'${END}${RED}. When the latest version of @x3r5e/icons becomes available, push an empty commit to the main branch to trigger this job again.\n${END}"
        exit 1
    elif [[ $( isLocalPackageVersionDifferentThanPublishedVersion "component-styles" ) = "true"  ]]
    then
        printf "${RED}Skipping publish of ${BOLD}@x3r5e/react-components${END}${RED} because the latest version of ${BOLD}@x3r5e/component-styles${END}${RED} is not yet available. After this build completes, pull the latest changes from the main branch and wait for the latest version of @x3r5e/component-styles to become available using the command ${BOLD}'npm view @x3r5e/component-styles version'${END}${RED}. When the latest version of @x3r5e/component-styles becomes available, push an empty commit to the main branch to trigger this job again.\n${END}"
        exit 1
    else
        publishReactComponentsPackage
    fi
fi
