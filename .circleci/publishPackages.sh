#!/bin/bash
set -e

# Command line arguments
args=("$@")
npm_token=${args[0]}
netlify_auth_token=${args[1]}
netlify_react_docs_id=${args[2]}

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

function getPublishedPackageVersionLatest() {
    local packageName="$1"

    echo $( npm view "$NPM_SCOPE""$packageName" version)
}

function getIsLocalVersionGreaterThanLatestVersion() {
    local packageName="$1"

    local localVersion=$( getLocalPackageVersion "$packageName" )
    local latestVersion=$( getPublishedPackageVersionLatest "$packageName" )

    IFS='.' read -r -a localVersionArray <<< "$localVersion"
    IFS='.' read -r -a latestVersionArray <<< "$latestVersion"

    local isLocalVersionGreaterThanLatestVersion="false"

    for i in {0..2}
    do
        localVersionNumber="${localVersionArray[i]}"
        latestVersionNumber="${latestVersionArray[i]}"

        if [ "$localVersionNumber" -gt "$latestVersionNumber" ]
        then
            isLocalVersionGreaterThanLatestVersion="true"
            break;
        elif [ "$localVersionNumber" -lt "$latestVersionNumber" ]
        then
            break;
        fi
    done

    echo "$isLocalVersionGreaterThanLatestVersion"
}

function printManualJobTriggerInstructions() {
    local packageName="$1"

    printf ""$RED"After this build completes, pull the latest changes from the main branch and wait for the latest version of "$NPM_SCOPE""$packageName" to become available using the command "$BOLD"'npm view "$NPM_SCOPE"/$packageName version'"$END""$RED". When the latest version of "$NPM_SCOPE""$packageName" becomes available, run the following curl command to trigger this job again:\n"$END""
    printf ""$RED"curl -u <CIRCLE_API_USER_TOKEN>: \\
        -d 'build_parameters[CIRCLE_JOB]=pull-request-checker' \\
        https://circleci.com/api/v1.1/project/github/danlevy1/example-design-system/tree/main\n"$END""
}

function beginPackagePublish() {
    local packageName="$1"

    printf "\n\n"$CYAN_BRIGHT"======== PUBLISHING "$NPM_SCOPE""$packageName" ========\n"$END""

    cd ./packages/"$packageName"

    # Writes the npm token to the npmrc file
    echo "//registry.npmjs.org/:_authToken=$npm_token" > .npmrc
    
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

# function publishComponentStylesPackage() {
#     local packageName="component-styles"

#     beginPackagePublish "$packageName"
        
#     npm install --save-exact "$NPM_SCOPE"design-tokens@latest
#     npm publish
    
#     endSuccessfulPackagePublish "$packageName"
# }

function publishReactComponentsPackage() {
    local packageName="react-components"

    beginPackagePublish "$packageName"
    
    npm install --save-exact "$NPM_SCOPE"icons@latest "$NPM_SCOPE"component-styles@latest
    npm publish
    
    endSuccessfulPackagePublish "$packageName"
}

function publishReactComponentsDocs() {
    printf "\n\n"$CYAN_BRIGHT"======== PUBLISHING DOCS FOR "$NPM_SCOPE""$packageName" ========\n"$END""

    cd packages/react-components

    npm run build:docs
    PATH=$(npm bin):$PATH netlify deploy --auth $netlify_auth_token --site $netlify_react_docs_id --dir=./docs --prod
    
    cd ../..

    printf ""$GREEN"======== "$NPM_SCOPE""$packageName" DOCS PUBLISHED ========\n\n"$END""
}

# Publishes the global-web-styles package
isNewVersionOfGlobalWebStylesBeingPublished=false;

if [[ $( getIsLocalVersionGreaterThanLatestVersion "global-web-styles" ) = "true" ]]
then
    isNewVersionOfGlobalWebStylesBeingPublished=true;
    publishGlobalWebStylesPackage
fi

# Publishes the design-tokens package
isNewVersionOfDesignTokensBeingPublished=false;

if [[ $( getIsLocalVersionGreaterThanLatestVersion "design-tokens" ) = "true" ]]
then
    isNewVersionOfDesignTokensBeingPublished=true;
    publishDesignTokensPackage
fi

# Publishes the icons package
isNewVersionOfIconsBeingPublished=false;

if [[ $( getIsLocalVersionGreaterThanLatestVersion "icons" ) = "true" ]]
then
    isNewVersionOfIconsBeingPublished=true;
    publishIconsPackage
fi

# Publishes the component-styles package if the latest version of the design-tokens package is available
# isNewVersionOfComponentStylesBeingPublished=false;

# if [[ $( getIsLocalVersionGreaterThanLatestVersion "component-styles" ) = "true" ]]
# then
#     isNewVersionOfComponentStylesBeingPublished=true;

#     if [[ $isNewVersionOfDesignTokensBeingPublished = true ]]
#     then
#         sleepBetweenPublishCommands
#     fi

#     if [[ $( getIsLocalVersionGreaterThanLatestVersion "design-tokens" ) = "true" ]]
#     then
#         printf ""$RED"Skipping publish of "$BOLD""$NPM_SCOPE"component-styles"$END""$RED" and "$BOLD""$NPM_SCOPE"/react-components"$END""$RED" because the latest version of "$BOLD""$NPM_SCOPE"/design-tokens"$END""$RED" is not yet available.\n"$END""
#         printManualJobTriggerInstructions design-tokens

#         exit 1
#     else
#         publishComponentStylesPackage
#     fi
# fi

# Publishes the react-components package if the latest version of the global-web-styles package, design-tokens package, and icons package is available
isNewVersionOfReactComponentsBeingPublished=false;

if [[ $( getIsLocalVersionGreaterThanLatestVersion "react-components" ) = "true" ]]
then
    isNewVersionOfReactComponentsBeingPublished=true;

    if [[ $isNewVersionOfGlobalWebStylesBeingPublished = true || $isNewVersionOfDesignTokensBeingPublished = true || $isNewVersionOfIconsBeingPublished = true ]]
    then
        sleepBetweenPublishCommands
    fi

    if [[ $( getIsLocalVersionGreaterThanLatestVersion "global-web-styles" ) = "true"  ]]
    then
        printf ""$RED"Skipping publish of "$BOLD""$NPM_SCOPE"react-components"$END""$RED" because the latest version of "$BOLD""$NPM_SCOPE"/global-web-styles"$END""$RED" is not yet available.\n"$END""
        printManualJobTriggerInstructions global-web-styles

        exit 1
    elif [[ $( getIsLocalVersionGreaterThanLatestVersion "design-tokens" ) = "true"  ]]
    then
        printf ""$RED"Skipping publish of "$BOLD""$NPM_SCOPE"react-components"$END""$RED" because the latest version of "$BOLD""$NPM_SCOPE"/design-tokens"$END""$RED" is not yet available.\n"$END""
        printManualJobTriggerInstructions design-tokens

        exit 1
    elif [[ $( getIsLocalVersionGreaterThanLatestVersion "icons" ) = "true"  ]]
    then
        printf ""$RED"Skipping publish of "$BOLD""$NPM_SCOPE"react-components"$END""$RED" because the latest version of "$BOLD""$NPM_SCOPE"/icons"$END""$RED" is not yet available.\n"$END""
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
