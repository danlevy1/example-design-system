#!/bin/bash
set -e

args=("$@")
npm_token=${args[0]}

# Command line output formats
CYAN_BRIGHT='\033[0;96m'
GREEN='\033[0;32m'
BOLD='\033[1m'
END='\e[0m'

# If the commit has a package publish tag, this script does not need to run
tagsAssociatedWithCommit=$( git tag --points-at HEAD )
if [[ ! -z $( echo $tagsAssociatedWithCommit | grep "^@x3r5e\/.*@.*" ) ]]
then
    printf "${GREEN}This commit is associated with a package publish tag: $tagsAssociatedWithCommit. This script will be skipped.\n${END}"
    exit 0
fi

# Returns an array of JSON objects, where each object is of the following shape:
# { name: package-name-without-scope, localVersion: version-from-package-json, publishedVersion: version-on-npm@latest }

# packageNames=($( ls ./packages ))
# packageVersions=()

# for packageName in "${packageNames[@]}"
# do
#     name=$packageName
#     localVersion=$( jq -r .version ./packages/$name/package.json )
#     publishedVersion=$( npm view @x3r5e/$name version)

#     packageVersions+=($( jq -nc \
#                                 --arg name "${name}" \
#                                 --arg localVersion "${localVersion}" \
#                                 --arg publishedVersion "${publishedVersion}" \
#                                 '{name: $name, localVersion: $localVersion, publishedVersion: $publishedVersion}' ) )
# done

# # Accepts an array of package version JSON objects, where each object is of the following shape:
# # { name: package-name-without-scope, localVersion: version-from-package-json, publishedVersion: version-on-npm@latest }
# # Returns an array of package names that need to be published
# packageNamesToPublish=()

# for packageVersion in "${packageVersions[@]}"
# do        
#     localVersion=$( jq -r .localVersion <<< $packageVersion)
#     publishedVersion=$( jq -r .publishedVersion <<< $packageVersion )

#     if [ $localVersion != $publishedVersion ]
#     then
#         name=$( jq -r .name <<< $packageVersion )
#         packageNamesToPublish+=($name)
#     fi
# done

# # Publish the packages

# # If none of the packages have had their version changed, skip publishing
# if [ -z "${packageNamesToPublish[@]}" ]
# then
#     printf "${GREEN}None of the packages have had their version change. Skipping publish.\n${END}"
#     exit 0
# fi

# if [[ "${packageNamesToPublish[@]}" =~ "design-tokens" ]]
# then
#         printf "\n\n${CYAN_BRIGHT}======== PUBLISHING @x3r5e/design-tokens ========\n${END}"
#         cd ./packages/design-tokens
#         echo "//registry.npmjs.org/:_authToken=$npm_token" > .npmrc
#         ls
#         npm ci
#         npm publish
#         cd ../..
#         printf "${GREEN}======== @x3r5e/design-tokens PUBLISHED ========\n\n${END}"
# fi

# if [[ "${packageNamesToPublish[@]}" =~ "icons" ]]
# then
#         printf "\n\n${CYAN_BRIGHT}======== PUBLISHING @x3r5e/icons ========\n${END}"
#         cd ./packages/icons
#         echo "//registry.npmjs.org/:_authToken=$npm_token" > .npmrc
#         npm ci
#         npm publish
#         cd ../..
#         printf "${GREEN}======== @x3r5e/icons PUBLISHED ========\n\n${END}"
# fi

# if [[ "${packageNamesToPublish[@]}" =~ "component-styles" ]]
# then
#         printf "\n\n${CYAN_BRIGHT}======== PUBLISHING @x3r5e/component-styles ========\n${END}"
#         cd ./packages/component-styles
#         echo "//registry.npmjs.org/:_authToken=$npm_token" > .npmrc
#         npm ci
#         npm install --save-dev @x3r5e/design-tokens@latest
#         npm publish
#         cd ../..
#         printf "${GREEN}======== @x3r5e/component-styles PUBLISHED ========\n\n${END}"
# fi

# if [[ "${packageNamesToPublish[@]}" =~ "react-components" ]]
# then
#         printf "\n\n${CYAN_BRIGHT}======== PUBLISHING @x3r5e/react-components ========\n${END}"
#         cd ./packages/react-components
#         echo "//registry.npmjs.org/:_authToken=$npm_token" > .npmrc
#         npm ci
#         npm install --save @x3r5e/icons@latest @x3r5e/component-styles@latest
#         npm publish
#         cd ../..
#         printf "${GREEN}======== @x3r5e/react-components PUBLISHED ========\n\n${END}"
# fi
