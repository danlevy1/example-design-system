#!/bin/bash
set -e

# Command line arguments
ARGS=("$@")
CIRCLE_BRANCH="${ARGS[0]}"
NPM_TOKEN="${ARGS[1]}"
NETLIFY_AUTH_TOKEN="${ARGS[2]}"
NETLIFY_REACT_DOCS_ID="${ARGS[3]}"

# Command line output formats
CYAN_BRIGHT='\033[0;96m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BOLD='\033[1m'
END='\e[0m'

# Other constants
NPM_SCOPE="@x3r5e/"

function sleepBetweenPublishCommands() {
    printf "\n\n"$CYAN_BRIGHT"======== SLEEPING FOR THREE MINUTES ========\n"$END""

    sleep 180

    printf "\n\n"$CYAN_BRIGHT"======== THREE MINUTE SLEEP HAS ENDED ========\n"$END""
}

function getLocalPackageVersion() {
    local packageName="$1"

    echo $( jq -r .version ./packages/"$packageName"/package.json )
}

function getLatestPackageVersion() {
    local packageName="$1"

    echo $( npm view "$NPM_SCOPE""$packageName" version)
}

function isPackageLocalVersionDifferntThanLatestVersion() {
    local packageName="$1"

    local localVersion=$( getLocalPackageVersion "$packageName" )
    local latestVersion=$( getLatestPackageVersion "$packageName" )

    if [[ $localVersion != $latestVersion ]]
    then
        echo "true"
    else
        echo "false"
    fi
}

function printManualJobTriggerInstructions() {
    local packageName="$1"
    local localVersion=$( getLocalPackageVersion "$packageName" )

    printf ""$RED"After this build completes, wait for "$NPM_SCOPE""$packageName"@"$localVersion" to become available using the command "$BOLD"'npm view "$NPM_SCOPE""$packageName"@"$localVersion" version'"$END""$RED". When that version of "$NPM_SCOPE""$packageName"@"$localVersion" becomes available, the command will return \""$localVersion"\". You can then run the following curl command to trigger this pipeline again:\n"$END""
    printf ""$RED"curl --request POST \\
     --url https://circleci.com/api/v2/project/gh/danlevy1/example-design-system/pipeline \\
     --header 'Circle-Token: <CIRCLECI_API_USER_TOKEN>' \\
     --header 'content-type: application/json' \\
     --data '{\"branch\":\""$CIRCLE_BRANCH"\"}'\n"$END""
}

function beginPackagePublish() {
    local packageName="$1"

    printf "\n\n"$CYAN_BRIGHT"======== PUBLISHING "$NPM_SCOPE""$packageName" ========\n"$END""

    cd ./packages/"$packageName"

    # Writes the npm token to the npmrc file
    echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc
    
    npm ci
}

function endSuccessfulPackagePublish() {
    local packageName="$1"

    cd ../..

    printf ""$GREEN"======== "$NPM_SCOPE""$packageName" PUBLISHED ========\n\n"$END""
}

function publishGlobalWebStylesPackage() {
    local packageName="global-web-styles"

    beginPackagePublish "$packageName"
    
    npm publish

    endSuccessfulPackagePublish "$packageName"
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

function publishReactComponentsPackage() {
    local packageName="react-components"
    local localVersion=$( getLocalPackageVersion "$packageName" )

    beginPackagePublish "$packageName"
    
    npm install --save-exact "$NPM_SCOPE"icons@"$localVersion" "$NPM_SCOPE"component-styles@"$localVersion"
    npm publish
    
    endSuccessfulPackagePublish "$packageName"
}

function publishReactComponentsDocs() {
    printf "\n\n"$CYAN_BRIGHT"======== PUBLISHING DOCS FOR "$NPM_SCOPE""$packageName" ========\n"$END""

    cd packages/react-components

    npm run build:docs
    PATH=$(npm bin):$PATH netlify deploy --auth $NETLIFY_AUTH_TOKEN --site $NETLIFY_REACT_DOCS_ID --dir=./docs --prod
    
    cd ../..

    printf ""$GREEN"======== "$NPM_SCOPE""$packageName" DOCS PUBLISHED ========\n\n"$END""
}

# Publishes the global-web-styles package
isNewVersionOfGlobalWebStylesBeingPublished=false;

if [[ $( isPackageLocalVersionDifferntThanLatestVersion "global-web-styles" ) = "true" ]]
then
    isNewVersionOfGlobalWebStylesBeingPublished=true;
    publishGlobalWebStylesPackage
fi

# Publishes the design-tokens package
isNewVersionOfDesignTokensBeingPublished=false;

if [[ $( isPackageLocalVersionDifferntThanLatestVersion "design-tokens" ) = "true" ]]
then
    isNewVersionOfDesignTokensBeingPublished=true;
    publishDesignTokensPackage
fi

# Publishes the icons package
isNewVersionOfIconsBeingPublished=false;

if [[ $( isPackageLocalVersionDifferntThanLatestVersion "icons" ) = "true" ]]
then
    isNewVersionOfIconsBeingPublished=true;
    publishIconsPackage
fi

# Publishes the react-components package if the latest version of the global-web-styles package, design-tokens package, and icons package is available
isNewVersionOfReactComponentsBeingPublished=false;

if [[ $( isPackageLocalVersionDifferntThanLatestVersion "react-components" ) = "true" ]]
then
    isNewVersionOfReactComponentsBeingPublished=true;

    if [[ $isNewVersionOfGlobalWebStylesBeingPublished = true || $isNewVersionOfDesignTokensBeingPublished = true || $isNewVersionOfIconsBeingPublished = true ]]
    then
        sleepBetweenPublishCommands
    fi

    if [[ $( isPackageLocalVersionDifferntThanLatestVersion "global-web-styles" ) = "true"  ]]
    then
        printf ""$RED"Skipping publish of "$BOLD""$NPM_SCOPE"react-components"$END""$RED" because the latest version of "$BOLD""$NPM_SCOPE"global-web-styles"$END""$RED" is not yet available.\n"$END""
        printManualJobTriggerInstructions global-web-styles

        exit 1
    elif [[ $( isPackageLocalVersionDifferntThanLatestVersion "design-tokens" ) = "true"  ]]
    then
        printf ""$RED"Skipping publish of "$BOLD""$NPM_SCOPE"react-components"$END""$RED" because the latest version of "$BOLD""$NPM_SCOPE"design-tokens"$END""$RED" is not yet available.\n"$END""
        printManualJobTriggerInstructions design-tokens

        exit 1
    elif [[ $( isPackageLocalVersionDifferntThanLatestVersion "icons" ) = "true"  ]]
    then
        printf ""$RED"Skipping publish of "$BOLD""$NPM_SCOPE"react-components"$END""$RED" because the latest version of "$BOLD""$NPM_SCOPE"icons"$END""$RED" is not yet available.\n"$END""
        printManualJobTriggerInstructions icons

        exit 1
    else
        publishReactComponentsPackage
        publishReactComponentsDocs
    fi
fi

# Updates GitHub
stagedFiles=$( git diff --cached )
if [[ "$stagedFiles" ]]
then
    git commit -m "chore: publish [skip ci]"
fi

git push --follow-tags

if [[ $isNewVersionOfGlobalWebStylesBeingPublished = false && $isNewVersionOfDesignTokensBeingPublished = false && $isNewVersionOfIconsBeingPublished = false && $isNewVersionOfComponentStylesBeingPublished = false && $isNewVersionOfReactComponentsBeingPublished = false ]]
then
    printf ""$GREEN"None of the packages have a version change. Nothing to publish.\n"$END""
fi
