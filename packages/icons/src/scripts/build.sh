#!/bin/bash
set -e

# Command line output formats
CYAN_BRIGHT='\033[0;96m'
GREEN='\033[0;32m'
BOLD='\033[1m'
END='\e[0m'

printf "${CYAN_BRIGHT}Formatting icons...\n${END}"

node --unhandled-rejections=strict -e 'const formatSvgIcons = require("./src/formatSvgIcons/formatSvgIcons.js"); formatSvgIcons();'

printf "${GREEN}SVG file(s) were successfully formatted\n${END}"

rollup -c

chmod u+x ./src/scripts/buildTypes.sh
./src/scripts/buildTypes.sh
