#!/bin/bash
set -e

# Command line output formats
CYAN_BRIGHT='\033[0;96m'
GREEN='\033[0;32m'
BOLD='\033[1m'
END='\e[0m'

printf "${CYAN_BRIGHT}Formatting icons...\n${END}"

node --unhandled-rejections=strict -e 'const formatSvgIcons = require("./src/scripts/formatSvgIcons/formatSvgIcons.js"); formatSvgIcons();'

printf "${GREEN}SVG file(s) were successfully formatted\n\n${END}"

printf "${CYAN_BRIGHT}Generating index.js and index.d.ts files...\n${END}"

indexJSFilePath=./src/index.js
indexDTSFilePath=./src/index.d.ts

printf "//This is an auto-generated file\n\n" > "$indexJSFilePath"
printf "//This is an auto-generated file\n\n" > "$indexDTSFilePath"

for svgFilepath in ./assets/svg/*.svg
do
    svgFilename=$(basename "${svgFilepath%.*}")
    echo export \{ default as $svgFilename \} from \"."$svgFilepath"\" >> "$indexJSFilePath"
    echo export const $svgFilename: string\; >> "$indexDTSFilePath"
done

printf "${GREEN}index.js and index.d.ts files were successfully generated\n${END}"

rollup -c
