#!/bin/bash
set -e

# Description: Builds TypeScript type declaration files.

tsConfigEntryFile=$( jq -r .files[0] tsconfig.json )

# Command line output formats
CYAN_BRIGHT='\033[0;96m'
GREEN='\033[0;32m'
BOLD='\033[1m'
END='\e[0m'

printf "\n${CYAN_BRIGHT}Creating TypeScript declaration files based on entry file ${BOLD}$tsConfigEntryFile${CYAN_BRIGHT}...\n${END}"

emittedFiles=($( tsc ))

printf "${GREEN}Created declaration files.\n${END}"
