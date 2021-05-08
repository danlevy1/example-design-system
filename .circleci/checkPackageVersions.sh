#!/bin/bash
set -e

# Command line arguments
ARGS=("$@")
CIRCLE_BRANCH="${ARGS[0]}"
IS_CUSTOM_RELEASE="${ARGS[1]}"

# Command line output formats
CYAN_BRIGHT='\033[0;96m'
GREEN='\033[0;32m'
RED='\033[0;31m'
BOLD='\033[1m'
END='\e[0m'

# Other constants
NPM_SCOPE="@x3r5e/"

chmod u+x ./.circleci/utils/getIsPackageLocalVersionDifferentThanLatestVersion.sh
chmod u+x ./.circleci/utils/getIsPackageLocalVersionGreaterThanLatestVersion.sh

isDesignTokensLocalVersionDifferentThanLatestVersion="$( ./.circleci/utils/getIsPackageLocalVersionDifferentThanLatestVersion.sh design-tokens )"
isGlobalWebStylesLocalVersionDifferentThanLatestVersion="$( ./.circleci/utils/getIsPackageLocalVersionDifferentThanLatestVersion.sh global-web-styles  )"
isIconsLocalVersionDifferentThanLatestVersion="$( ./.circleci/utils/getIsPackageLocalVersionDifferentThanLatestVersion.sh icons )"
isReactComponentsLocalVersionDifferentThanLatestVersion="$( ./.circleci/utils/getIsPackageLocalVersionDifferentThanLatestVersion.sh react-components )"

isDesignTokensLocalVersionGreaterThanLatestVersion="$( ./.circleci/utils/getIsPackageLocalVersionGreaterThanLatestVersion.sh design-tokens )"
isGlobalWebStylesLocalVersionGreaterThanLatestVersion="$( ./.circleci/utils/getIsPackageLocalVersionGreaterThanLatestVersion.sh global-web-styles  )"
isIconsLocalVersionGreaterThanLatestVersion="$( ./.circleci/utils/getIsPackageLocalVersionGreaterThanLatestVersion.sh icons )"
isReactComponentsLocalVersionGreaterThanLatestVersion="$( ./.circleci/utils/getIsPackageLocalVersionGreaterThanLatestVersion.sh react-components )"

isDesignTokensVersionValidForNormalRelease="true"
if [[ "$isDesignTokensLocalVersionDifferentThanLatestVersion" = "true" && "$isDesignTokensLocalVersionGreaterThanLatestVersion" = "false" ]]
then
    isDesignTokensVersionValidForNormalRelease="false"
fi

isGlobalWebStylesVersionValidForNormalRelease="true"
if [[ "$isGlobalWebStylesLocalVersionDifferentThanLatestVersion" = "true" && "$isGlobalWebStylesLocalVersionGreaterThanLatestVersion" = "false" ]]
then
    isGlobalWebStylesVersionValidForNormalRelease="false"
fi

isIconsVersionValidForNormalRelease="true"
if [[ "$isIconsLocalVersionDifferentThanLatestVersion" = "true" && "$isIconsLocalVersionGreaterThanLatestVersion" = "false" ]]
then
    isIconsVersionValidForNormalRelease="false"
fi

isReactComponentsVersionValidForNormalRelease="true"
if [[ "$isReactComponentsLocalVersionDifferentThanLatestVersion" = "true" && "$isReactComponentsLocalVersionGreaterThanLatestVersion" = "false" ]]
then
    isReactComponentsVersionValidForNormalRelease="false"
fi

# Check if at least one package version has changed
if [[ "$isDesignTokensLocalVersionDifferentThanLatestVersion" = "false" &&  "$isGlobalWebStylesLocalVersionDifferentThanLatestVersion" = "false" && "$isIconsLocalVersionDifferentThanLatestVersion" = "false" && "$isReactComponentsLocalVersionDifferentThanLatestVersion" = "false" ]]
then
    printf ""$RED"No package versions have changed. Branch names that include \"normal-relese\" or \"custom-release\" are only used for releases. Either change the name of this branch or change package version(s) for release.\n"$END""

    exit 1;
fi

# Check if package version changes are valid for a normal release (i.e. not a custom release)
if [[ "$IS_CUSTOM_RELEASE" = false && "$isDesignTokensVersionValidForNormalRelease" = "false" || "$isGlobalWebStylesVersionValidForNormalRelease" = "false" || "$isIconsVersionValidForNormalRelease" = "false" || "$isReactComponentsVersionValidForNormalRelease" = "false" ]]
then
    printf ""$RED"The following package versions have changed, but are not greater than the \`@latest\` version:\n"$END""

    if [[ "$isDesignTokensVersionValidForNormalRelease" = "false" ]]
    then
        printf ""$RED"-> "$BOLD""$NPM_SCOPE"design-tokens\n"$END""
    fi

    if [[ "$isGlobalWebStylesVersionValidForNormalRelease" = "false"  ]]
    then
        printf ""$RED"-> "$BOLD""$NPM_SCOPE"global-web-styles\n"$END""
    fi

    if [[ "$isIconsVersionValidForNormalRelease" = "false"  ]]
    then
        printf ""$RED"-> "$BOLD""$NPM_SCOPE"icons\n"$END""
    fi

    if [[ "$isReactComponentsVersionValidForNormalRelease" = "false"  ]]
    then
        printf ""$RED"-> "$BOLD""$NPM_SCOPE"react-components\n"$END""
    fi

    printf "\n"$RED"Since you are running a normal release, all package versions must be greater than or equal to the \`@latest\` version. To run a release of package(s) using a custom version change, follow the \"Custom Release\" guide.\n"$END""
    
    exit 1;
fi

# Check if react-components doesn't have a version change.
# If we have reached this line of code without failing, at least one package is ready for release.
# If that one package is not react-components, we need to fail because the other package(s) are used inside of react-components.
# If a dependency of react-components is released, react-components should also be released.
if [[ "$isReactComponentsLocalVersionDifferentThanLatestVersion" = "false" ]]
then
    printf ""$RED"The version of "$BOLD""$NPM_SCOPE"react-components"$END""$RED" has not been changed for release, but the following dependencies have a version change for release:\n"$END""
    
    if [[ "$isDesignTokensLocalVersionDifferentThanLatestVersion" = "true"  ]]
    then
        printf ""$RED"-> "$BOLD""$NPM_SCOPE"design-tokens\n"$END""
    fi
    
    if [[ "$isGlobalWebStylesLocalVersionDifferentThanLatestVersion" = "true" ]]
    then
        printf ""$RED"-> "$BOLD""$NPM_SCOPE"global-web-styles\n"$END""
    fi

    if [[ "$isIconsLocalVersionDifferentThanLatestVersion" = "true" ]]
    then
        printf ""$RED"-> "$BOLD""$NPM_SCOPE"icons\n"$END""
    fi

    printf "\n"$RED"When dependencies of "$BOLD""$NPM_SCOPE"react-components"$END""$RED" are released, "$BOLD""$NPM_SCOPE"react-components"$END""$RED" should also be released. To fix this error, change the version of "$BOLD""$NPM_SCOPE"react-components.\n"$END""

    exit 1
fi

# Success Message
printf ""$GREEN"The following packages are ready for release:\n"$END""

if [[ "$isDesignTokensLocalVersionDifferentThanLatestVersion" = "true" ]]
then
    printf ""$GREEN"-> "$BOLD""$NPM_SCOPE"design-tokens\n"$END""
fi

if [[ "$isGlobalWebStylesLocalVersionDifferentThanLatestVersion" = "true" ]]
then
    printf ""$GREEN"-> "$BOLD""$NPM_SCOPE"global-web-styles\n"$END""
fi

if [[ "$isIconsLocalVersionDifferentThanLatestVersion" = "true" ]]
then
    printf ""$GREEN"-> "$BOLD""$NPM_SCOPE"icons\n"$END""
fi

if [[ "$isReactComponentsLocalVersionDifferentThanLatestVersion" = "true" ]]
then
    printf ""$GREEN"-> "$BOLD""$NPM_SCOPE"react-components\n"$END""
fi
