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

function printManualJobTriggerInstructions() {
    local packageName="$1"

    printf "${RED}After this build completes, pull the latest changes from the main branch and wait for the latest version of @x3r5e/$packageName to become available using the command ${BOLD}'npm view @x3r5e/$packageName version'${END}${RED}. When the latest version of @x3r5e/$packageName becomes available, run the following curl command to trigger this job again:\n${END}"
    printf "${RED}curl -u <CIRCLE_API_USER_TOKEN>: \\
        -d 'build_parameters[CIRCLE_JOB]=pull-request-checker' \\
        https://circleci.com/api/v1.1/project/github/danlevy1/example-design-system/tree/main\n${END}"
}

function beginPackagePublish() {
    local packageName="$1"

    printf "\n\n${CYAN_BRIGHT}======== PUBLISHING @x3r5e/"$packageName" ========\n${END}"

    cd ./packages/"$packageName"

    # Writes the npm token to the npmrc file
    echo "//registry.npmjs.org/:_authToken=$npm_token" > .npmrc
    
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

# Publishes the design-tokens package
isNewVersionOfDesignTokensBeingPublished=false;

if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "design-tokens" ) = "true" ]]
then
    isNewVersionOfDesignTokensBeingPublished=true;
    publishDesignTokensPackage
fi

# Publishes the icons package
isNewVersionOfIconsBeingPublished=false;

if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "icons" ) = "true" ]]
then
    isNewVersionOfIconsBeingPublished=true;
    publishIconsPackage
fi

# Publishes the component-styles package if the latest version of the design-tokens package is available
isNewVersionOfComponentStylesBeingPublished=false;

if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "component-styles" ) = "true" ]]
then
    isNewVersionOfComponentStylesBeingPublished=true;

    if [[ $isNewVersionOfDesignTokensBeingPublished = true ]]
    then
        sleepBetweenPublishCommands
    fi

    if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "design-tokens" ) = "true" ]]
    then
        printf "${RED}Skipping publish of ${BOLD}@x3r5e/component-styles${END}${RED} and ${BOLD}@x3r5e/react-components${END}${RED} because the latest version of ${BOLD}@x3r5e/design-tokens${END}${RED} is not yet available.\n${END}"
        printManualJobTriggerInstructions design-tokens

        exit 1
    else
        publishComponentStylesPackage
    fi
fi

# Publishes the react-components package if the latest version of the icons package and component-styles package is available
isNewVersionOfReactComponentsBeingPublished=false;

if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "react-components" ) = "true" ]]
then
    isNewVersionOfReactComponentsBeingPublished=true;

    if [[ $isNewVersionOfIconsBeingPublished = true || $isNewVersionOfComponentStylesBeingPublished = true ]]
    then
        sleepBetweenPublishCommands
    fi

    if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "icons" ) = "true"  ]]
    then
        printf "${RED}Skipping publish of ${BOLD}@x3r5e/react-components${END}${RED} because the latest version of ${BOLD}@x3r5e/icons${END}${RED} is not yet available.\n${END}"
        printManualJobTriggerInstructions icons

        exit 1
    elif [[ $( isLocalPackageVersionDifferentThanPublishedVersion "component-styles" ) = "true"  ]]
    then
        printf "${RED}Skipping publish of ${BOLD}@x3r5e/react-components${END}${RED} because the latest version of ${BOLD}@x3r5e/component-styles${END}${RED} is not yet available.\n${END}"
        printManualJobTriggerInstructions component-styles

        exit 1
    else
        publishReactComponentsPackage
    fi
fi

# Updates GitHub
stagedFiles=$( git diff --cached )
if [[ "$stagedFiles" ]]
then
    git commit -m "chore: publish [skip ci]"
fi

git push --follow-tags

if [[ $isNewVersionOfDesignTokensBeingPublished = false && $isNewVersionOfIconsBeingPublished = false && $isNewVersionOfComponentStylesBeingPublished = false && $isNewVersionOfReactComponentsBeingPublished = false ]]
then
    printf "${GREEN}None of the packages have a version change. Nothing to publish.\n${END}"
fi
