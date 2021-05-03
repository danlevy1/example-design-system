#!/bin/bash
set -e

# Command line arguments
ARGS=("$@")
CIRCLE_BRANCH="${ARGS[0]}"

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

chmod u+x ./.circleci/utils/getIsPackageReadyForRelease.sh

isDesignTokensReadyForRelease="$( ./.circleci/utils/getIsPackageReadyForRelease.sh design-tokens )"
isGlobalWebStylesReadyForRelease="$( ./.circleci/utils/getIsPackageReadyForRelease.sh global-web-styles )"
isIconsReadyForRelease="$( ./.circleci/utils/getIsPackageReadyForRelease.sh icons )"
isReactComponentsReadyForRelease="$( ./.circleci/utils/getIsPackageReadyForRelease.sh react-components )"

if [[ "$isReactComponentsReadyForRelease" = "false" && ("$isDesignTokensReadyForRelease" = "true" || "$isGlobalWebStylesReadyForRelease" = "true" || "$isIconsReadyForRelease" = "true") ]]
then
    printf ""$RED"The version of "$BOLD""$NPM_SCOPE"react-components"$END""$RED" has not been changed for release, but the following dependencies have their version changed for release:\n"$END""
    
    if [[ "$isDesignTokensReadyForRelease" = "true"  ]]
    then
        printf ""$RED"-> "$BOLD""$NPM_SCOPE"design-tokens\n"$END""
    fi
    
    if [[ "$isGlobalWebStylesReadyForRelease" = "true" ]]
    then
        printf ""$RED"-> "$BOLD""$NPM_SCOPE"global-web-styles\n"$END""
    fi

    if [[ "$isIconsReadyForRelease" = "true" ]]
    then
        printf ""$RED"-> "$BOLD""$NPM_SCOPE"icons\n"$END""
    fi

    printf "\n"$RED"The version of "$BOLD""$NPM_SCOPE"react-components"$END""$RED" needs to be changed before a release of the above packages can occur.\n"$END""

    exit 1
elif [[ "$isDesignTokensReadyForRelease" = "false" && "$isGlobalWebStylesReadyForRelease" = "false" && "$isIconsReadyForRelease" = "false" && "$isReactComponentsReadyForRelease" = "false" ]]
then
    printf ""$RED"No packages will be released. Update package version(s) as needed before merging this PR.\n"$END""

    if [[ "$IS_CUSTOM_RELEASE" = false ]]
    then
        printf ""$RED"Package versions need to be higher than their current \`@latest\` version to be released. To run a release of package(s) using a custom version change, follow the \"Custom Release\" guide.\n"$END""
    fi

    exit 1
else
    printf ""$GREEN"The following packages are ready for release:\n"$END""

    if [[ "$isDesignTokensReadyForRelease" = "true" ]]
    then
        printf ""$GREEN"-> "$BOLD""$NPM_SCOPE"design-tokens\n"$END""
    fi
    
    if [[ "$isGlobalWebStylesReadyForRelease" = "true" ]]
    then
        printf ""$GREEN"-> "$BOLD""$NPM_SCOPE"global-web-styles\n"$END""
    fi

    if [[ "$isIconsReadyForRelease" = "true" ]]
    then
        printf ""$GREEN"-> "$BOLD""$NPM_SCOPE"icons\n"$END""
    fi

    if [[ "$isReactComponentsReadyForRelease" = "true" ]]
    then
        printf ""$GREEN"-> "$BOLD""$NPM_SCOPE"react-components\n"$END""
    fi
fi