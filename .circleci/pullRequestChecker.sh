#!/bin/bash
set -e

# Command line output formats
CYAN_BRIGHT='\033[0;96m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BOLD='\033[1m'
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

function installDependencies() {
    local packageName="$1"

    cd ./packages/"$packageName"

    if [[ ! -d node_modules ]]
    then
        printf "${CYAN_BRIGHT}-------- INSTALLING DEPENDENCIES FOR @x3r5e/"$packageName" --------\n${END}"

        npm ci --yes

        printf "\n${GREEN}-------- DEPENDENCIES SUCCESSFULLY INSTALLED FOR @x3r5e/"$packageName" --------\n\n\n${END}"
    else
        printf "${GREEN}Using cache for @x3r5e/$packageName. No install needed.\n\n\n${END}"
    fi

    cd ../..
}

function linkDependency() {
    local packageName="$1"
    local dependencyName="$2"

    sudo chown -R $( whoami ) $( npm prefix -g )
    
    cd ./packages/"$packageName"
    
    npm link ../"$dependencyName"

    cd ../..
}

function linkComponentStylesDependencies() {
    if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "design-tokens" ) = "true"  ]]
    then
        printf "${CYAN_BRIGHT}-------- LINKING @x3r5e/design-tokens INTO @x3r5e/component-styles --------\n${END}"

        linkDependency component-styles design-tokens

        printf "\n${GREEN}-------- @x3r5e/design-tokens LINKED INTO @x3r5e/component-styles --------\n\n\n${END}"
    else
        printf "${CYAN_BRIGHT}@x3r5e/design-tokens was not linked into @x3r5e/component-styles\n\n\n${END}"
    fi
}

function linkReactComponentsDependencies() {
    if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "icons" ) = "true"  ]]
    then
        printf "${CYAN_BRIGHT}-------- LINKING @x3r5e/icons INTO @x3r5e/react-components --------\n${END}"

        linkDependency react-components icons

        printf "\n${GREEN}-------- @x3r5e/icons LINKED INTO @x3r5e/react-components --------\n\n\n${END}"
    else
        printf "${CYAN_BRIGHT}@x3r5e/icons was not linked into @x3r5e/react-components\n\n\n${END}"
    fi

    if [[ $( isLocalPackageVersionDifferentThanPublishedVersion "component-styles" ) = "true"  ]]
    then
        printf "${CYAN_BRIGHT}-------- LINKING @x3r5e/component-styles INTO @x3r5e/react-components --------\n\n${END}"

        linkDependency react-components component-styles

        printf "\n${GREEN}-------- @x3r5e/component-styles LINKED INTO @x3r5e/react-components --------\n\n\n${END}"
    else
        printf "${CYAN_BRIGHT}@x3r5e/component-styles was not linked into @x3r5e/react-components\n\n\n${END}"
    fi
}

function runLinter() {
    local packageName="$1"

    printf "${CYAN_BRIGHT}-------- RUNNING LINTER CHECK FOR @x3r5e/"$packageName" --------\n${END}"

    cd ./packages/"$packageName"
    
    npm run lint

    cd ../..

    printf "${GREEN}-------- LINTER CHECK PASSED FOR @x3r5e/"$packageName" --------\n\n\n${END}"
}

function runTests() {
    local packageName="$1"

    # If the `git diff` command returns a diff, run the tests
    diff=$( git diff origin/main -- ./packages/$packageName/src )
    
    if [[ $diff ]]
    then
        printf "${CYAN_BRIGHT}-------- RUNNING TESTS FOR @x3r5e/$packageName --------\n${END}"

        cd packages/"$packageName"
        npm test
        cd ../..
        
        printf "\n${GREEN}-------- TESTS PASSED FOR @x3r5e/$packageName --------\n\n\n${END}"
    else
        printf "${GREEN}No changes in the src directory for ${BOLD}@x3r5e/$packageName${END}${GREEN}. Skipping tests.\n\n\n${END}"
    fi
}

function buildPackage() {
    local packageName="$1"

    printf "${CYAN_BRIGHT}-------- BUILDING @x3r5e/$packageName --------\n${END}"

    cd ./packages/"$packageName"

    npm run build

    cd ../..

    printf "\n${GREEN}-------- @x3r5e/$packageName SUCCESSFULLY BUILT --------\n\n${END}"
}

function beginPackagePRChecker() {
    printf "\n${CYAN_BRIGHT}======================== RUNNING CHECKS FOR @x3r5e/$packageName ========================\n\n${END}"
}

function endPackagePRChecker() {
    printf "\n${GREEN}======================== CHECKS FOR @x3r5e/$packageName HAVE SUCCESSFULLY COMPLETED ========================\n\n${END}"
}

function runGlobalWebStylesPRChecker() {
    local packageName="global-web-styles"

    beginPackagePRChecker
    installDependencies "$packageName"
    runLinter "$packageName"
    runTests "$packageName"
    buildPackage "$packageName"
    endPackagePRChecker
}

function runDesignTokensPRChecker() {
    local packageName="design-tokens"

    beginPackagePRChecker
    installDependencies "$packageName"
    runLinter "$packageName"
    runTests "$packageName"
    buildPackage "$packageName"
    endPackagePRChecker
}

function runIconsPRChecker() {
    local packageName="icons"

    beginPackagePRChecker
    installDependencies "$packageName"
    runLinter "$packageName"
    runTests "$packageName"
    buildPackage "$packageName"
    endPackagePRChecker
}

function runComponentStylesPRChecker() {
    local packageName="component-styles"

    beginPackagePRChecker
    installDependencies "$packageName"
    linkComponentStylesDependencies
    runLinter "$packageName"
    runTests "$packageName"
    buildPackage "$packageName"
    endPackagePRChecker
}

function runReactComponentsPRChecker() {
    local packageName="react-components"

    beginPackagePRChecker
    installDependencies "$packageName"
    linkReactComponentsDependencies
    runLinter "$packageName"
    runTests "$packageName"
    buildPackage "$packageName"
    endPackagePRChecker
}

if [[ ! -d node_modules ]]
then
    npm ci --yes
else
    printf "${GREEN}Using cache for root package. No install needed.\n\n${END}"
fi

runGlobalWebStylesPRChecker
runDesignTokensPRChecker
runIconsPRChecker
runComponentStylesPRChecker
runReactComponentsPRChecker
