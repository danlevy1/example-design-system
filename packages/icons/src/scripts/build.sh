#!/bin/bash
set -e

# Command line output formats
CYAN_BRIGHT='\033[0;96m'
GREEN='\033[0;32m'
BOLD='\033[1m'
END='\e[0m'

printf "${CYAN_BRIGHT}Formatting icons...\n${END}"

node --unhandled-rejections=strict -e 'const formatSvgIcons = require("./src/formatSvgIcons/formatSvgIcons.js"); formatSvgIcons();'

printf "\n${CYAN_BRIGHT}Copying icons to the ${BOLD}'dist' ${CYAN_BRIGHT}directory...\n${END}"

if [ -d "./dist" ]
then
    rm -r ./dist
fi

numIcons=$( ls ./assets | wc -l | xargs)

cp -r ./assets ./dist

printf "${GREEN}Copied ${BOLD}$numIcons ${GREEN}icon(s) to the ${BOLD}'dist' ${GREEN}directory\n${END}"
