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
IS_CUSTOM_RELEASE=true

if [[ "$CIRCLE_BRANCH" = "main" ]]
then
    IS_CUSTOM_RELEASE=false
fi


function waitForSleep() {
    printf "\n\n"$CYAN_BRIGHT"======== SLEEPING FOR THREE MINUTES ========\n"$END""

    # Sleep for 3 minutes
    echo "Sleep started on $( date )"
    sleep 180
    echo "Sleep ended on $( date )"

    printf ""$CYAN_BRIGHT"======== THREE MINUTE SLEEP HAS ENDED ========\n"$END""
}

function getLocalPackageVersion() {
    local packageName="$1"

    echo $( jq -r .version ./packages/"$packageName"/package.json )
}

function getLatestPackageVersion() {
    local packageName="$1"

    echo $( npm view "$NPM_SCOPE""$packageName" version)
}

function getIsPackageLocalVersionPublished() {
    local packageName="$1"

    local localVersion=$( getLocalPackageVersion "$packageName" )
    local latestVersion=$( getLatestPackageVersion "$packageName" )

    if [[ $localVersion = $latestVersion ]]
    then
        echo "true"
    else
        echo "false"
    fi
}

function getIsPackageLocalVersionDifferentThanLatestVersion() {
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

function getIsPackageLocalVersionGreaterThanLatestVersion() {
    local packageName="$1"

    local localVersion=$( getLocalPackageVersion "$packageName" )
    local latestVersion=$( getLatestPackageVersion "$packageName" )

    IFS='.' read -ra localVersionSplit <<< "$localVersion"
    IFS='.' read -ra latestVersionSplit <<< "$latestVersion"

    local isPackageLocalVersionGreaterThanLatestVersion="false";

    for versionNumberIndex in {0..2}
    do
        local localVersionNumber="${localVersionSplit[versionNumberIndex]}"
        local latestVersionNumber="${latestVersionSplit[versionNumberIndex]}"

        if [ "$localVersionNumber" -gt "$latestVersionNumber" ]
        then
            isPackageLocalVersionGreaterThanLatestVersion="true";
            break;
        elif [ "$localVersionNumber" -lt "$latestVersionNumber" ]
        then
            break;
        fi
    done

    echo "$isPackageLocalVersionGreaterThanLatestVersion"
}

function isPackageReadyForRelease() {
    local packageName="$1"

    if [ "$IS_CUSTOM_RELEASE" = true ]
    then
        echo $( getIsPackageLocalVersionDifferentThanLatestVersion "$packageName" )
    else
        echo $( getIsPackageLocalVersionGreaterThanLatestVersion "$packageName" )
    fi
}

function printSkipReleaseInfo() {
    local skippedPackageName="$1"
    local causedPackageName="$2"

    printf ""$RED"Skipping publish of "$BOLD""$NPM_SCOPE""$skippedPackageName"@"$( getLocalPackageVersion "$skippedPackageName" )""$END""$RED" because the local version of "$BOLD""$NPM_SCOPE""$causedPackageName"@"$( getLocalPackageVersion "$causedPackageName" )""$END""$RED" is not yet available on npm.\n"$END""
}

function printManualJobTriggerInstructions() {
    local packageNameToWaitFor="$1"
    local localVersion=$( getLocalPackageVersion "$packageNameToWaitFor" )

    printf ""$RED"After this pipeline completes, wait for "$BOLD""$NPM_SCOPE""$packageNameToWaitFor"@"$localVersion""$END""$RED" to become available using the command "$BOLD"'npm view "$NPM_SCOPE""$packageNameToWaitFor"@"$localVersion" version'"$END""$RED". When "$BOLD""$NPM_SCOPE""$packageNameToWaitFor"@"$localVersion""$END""$RED" becomes available, the command will return "$BOLD"\""$localVersion"\""$END""$RED". You can then run the following curl command to trigger this pipeline again:\n"$END""
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
    local localDesignTokensVersion=$( getLocalPackageVersion design-tokens )
    local localIconsVersion=$( getLocalPackageVersion icons )

    beginPackagePublish "$packageName"
    
    npm install --save-exact "$NPM_SCOPE"design-tokens@"$localDesignTokensVersion" "$NPM_SCOPE"icons@"$localIconsVersion"
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

# ======== Start publish of the global-web-styles package ========
isNewVersionOfGlobalWebStylesBeingPublished=false;

if [[ $( isPackageReadyForRelease "global-web-styles" ) = "true" ]]
then
    isNewVersionOfGlobalWebStylesBeingPublished=true;
    publishGlobalWebStylesPackage
fi
# ======== End publish of the global-web-styles package ========

# ======== Start publish of the design-tokens package ========
isNewVersionOfDesignTokensBeingPublished=false;

if [[ $( isPackageReadyForRelease "design-tokens" ) = "true" ]]
then
    isNewVersionOfDesignTokensBeingPublished=true;
    publishDesignTokensPackage
fi
# ======== End publish of the design-tokens package ========

# ======== Start publish of the icons package ========
isNewVersionOfIconsBeingPublished=false;

if [[ $( isPackageReadyForRelease "icons" ) = "true" ]]
then
    isNewVersionOfIconsBeingPublished=true;
    publishIconsPackage
fi
# ======== End publish of the icons package ========

# ======== Start publish of the react-components package ========
# Publishes the react-components package if the latest version of the global-web-styles package, design-tokens package, and icons package is available
isNewVersionOfReactComponentsBeingPublished=false;

if [[ $( isPackageReadyForRelease "react-components" ) = "true" ]]
then
    isNewVersionOfReactComponentsBeingPublished=true;

    if [[ $isNewVersionOfGlobalWebStylesBeingPublished = true || $isNewVersionOfDesignTokensBeingPublished = true || $isNewVersionOfIconsBeingPublished = true ]]
    then
        waitForSleep
    fi

    if [[ $( getIsPackageLocalVersionPublished "global-web-styles" ) = "false"  ]]
    then
        printSkipReleaseInfo react-components global-web-styles
        printManualJobTriggerInstructions global-web-styles

        exit 1
    elif [[ $( getIsPackageLocalVersionPublished "design-tokens" ) = "false"  ]]
    then
        printSkipReleaseInfo react-components design-tokens
        printManualJobTriggerInstructions design-tokens

        exit 1
    elif [[ $( getIsPackageLocalVersionPublished "icons" ) = "false"  ]]
    then
        printSkipReleaseInfo react-components icons
        printManualJobTriggerInstructions icons

        exit 1
    else
        publishReactComponentsPackage
        publishReactComponentsDocs
    fi
fi
# ======== End publish of the react-components package ========

# ======== Start updating GitHub repo ========
stagedFiles=$( git diff --cached )
if [[ "$stagedFiles" ]]
then
    git commit -m "chore: publish [skip ci]"
fi

git push --follow-tags
# ======== End updating GitHub repo ========

# If none of the packages have a valid version change, no packages were published
if [[ $isNewVersionOfGlobalWebStylesBeingPublished = false && $isNewVersionOfDesignTokensBeingPublished = false && $isNewVersionOfIconsBeingPublished = false && $isNewVersionOfReactComponentsBeingPublished = false ]]
then
    if [ "$IS_CUSTOM_RELEASE" = true ]
    then
        printf ""$GREEN"None of the packages have a version change. Nothing to publish.\n"$END""
    else
        printf ""$GREEN"None of the packages have a version greater than \`@latest\`. Nothing to publish.\n"$END""
    fi
fi
