#!/bin/bash
set -e

# Command line arguments
ARGS=("$@")
NETLIFY_AUTH_TOKEN=${ARGS[0]}
NETLIFY_REACT_DOCS_ID=${ARGS[1]}

# Command line output formats
CYAN_BRIGHT='\033[0;96m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BOLD='\033[1m'
END='\e[0m'

# Other Constants
NPM_SCOPE="@x3r5e/"

function runLinter() {
    local packageName="$1"

    printf ""$CYAN_BRIGHT"-------- RUNNING LINTER CHECK FOR @x3r5e/"$packageName" --------\n"$END""

    cd ./packages/"$packageName"
    
    npm run lint

    cd ../..

    printf ""$GREEN"-------- LINTER CHECK PASSED FOR @x3r5e/"$packageName" --------\n\n\n"$END""
}

function runTests() {
    local packageName="$1"

    # If the `git diff` command returns a diff, run the tests
    diff=$( git diff origin/main -- ./packages/$packageName/src )
    
    if [[ $diff ]]
    then
        printf ""$CYAN_BRIGHT"-------- RUNNING TESTS FOR @x3r5e/$packageName --------\n"$END""

        cd packages/"$packageName"
        npm test
        cd ../..
        
        printf "\n"$GREEN"-------- TESTS PASSED FOR @x3r5e/$packageName --------\n\n\n"$END""
    else
        printf ""$GREEN"No changes in the src directory for "$BOLD"@x3r5e/$packageName"$END""$GREEN". Skipping tests.\n\n\n"$END""
    fi
}

function buildPackage() {
    local packageName="$1"

    printf ""$CYAN_BRIGHT"-------- BUILDING @x3r5e/$packageName --------\n"$END""

    cd ./packages/"$packageName"

    npm run build

    cd ../..

    printf "\n"$GREEN"-------- @x3r5e/$packageName SUCCESSFULLY BUILT --------\n\n"$END""
}

function buildDocs() {
    local packageName="$1"

    printf ""$CYAN_BRIGHT"-------- BUILDING DOCS FOR @x3r5e/$packageName --------\n"$END""

    cd ./packages/"$packageName"

    npm run build:docs

    cd ../..

    printf "\n"$GREEN"-------- @x3r5e/$packageName DOCS SUCCESSFULLY BUILT --------\n\n"$END""
}

function deployDocsDryRun() {
    local packageName="$1"

    printf ""$CYAN_BRIGHT"-------- STARTING A DRY-RUN DOCS DEPLOYMENT FOR @x3r5e/$packageName --------\n"$END""

    cd ./packages/"$packageName"

    PATH=$(npm bin):$PATH netlify deploy --auth $NETLIFY_AUTH_TOKEN --site $NETLIFY_REACT_DOCS_ID --dir=./docs

    cd ../..

    printf "\n"$GREEN"-------- DRY-RUN DOCS DEPLOYMENT @x3r5e/$packageName SUCCESSFULLY COMPLETED --------\n\n"$END""
}

function beginPackagePRChecker() {
    printf "\n"$CYAN_BRIGHT"======================== RUNNING CHECKS FOR @x3r5e/$packageName ========================\n\n"$END""
}

function endPackagePRChecker() {
    printf "\n"$GREEN"======================== CHECKS FOR @x3r5e/$packageName HAVE SUCCESSFULLY COMPLETED ========================\n\n"$END""
}

function runGlobalWebStylesPRChecker() {
    local packageName="global-web-styles"

    beginPackagePRChecker
    runLinter "$packageName"
    runTests "$packageName"
    buildPackage "$packageName"
    endPackagePRChecker
}

function runDesignTokensPRChecker() {
    local packageName="design-tokens"

    beginPackagePRChecker
    runLinter "$packageName"
    runTests "$packageName"
    buildPackage "$packageName"
    endPackagePRChecker
}

function runIconsPRChecker() {
    local packageName="icons"

    beginPackagePRChecker
    runLinter "$packageName"
    runTests "$packageName"
    buildPackage "$packageName"
    endPackagePRChecker
}

function runReactComponentsPRChecker() {
    local packageName="react-components"

    beginPackagePRChecker
    runLinter "$packageName"
    runTests "$packageName"
    buildPackage "$packageName"
    buildDocs "$packageName"
    deployDocsDryRun "$packageName"
    endPackagePRChecker
}

# Grant permission to other scripts
chmod u+x ./.circleci/checkPackageVersions.sh

# ======== Start installation of dependencies ========
if [[ ! -d node_modules ]]
then
    npm run install:all:ci
else
    printf ""$GREEN"Using cache. No install needed.\n\n"$END""
fi
# ======== End installation of dependencies ========

# Link all packages together
npm run link:all

# ======== Start package checkers ========
if [[ "$CIRCLE_BRANCH" =~ ^.*normal-release.* ]]
then
    ./.circleci/checkPackageVersions.sh "$CIRCLE_BRANCH" false
fi

runGlobalWebStylesPRChecker
runDesignTokensPRChecker
runIconsPRChecker
runReactComponentsPRChecker
# ======== End package checkers ========
