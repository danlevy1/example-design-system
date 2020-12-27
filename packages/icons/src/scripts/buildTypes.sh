#!/bin/bash
set -e

# Description: Builds TypeScript type declaration files.

tsConfigEntryFile=$( jq -r .files[0] tsconfig.json )

# Command line output formats
CYAN_BRIGHT='\033[0;96m'
GREEN='\033[0;32m'
BOLD='\033[1m'
END='\e[0m'

printf "\n${CYAN_BRIGHT}Generating TypeScript declaration files based on entry file ${BOLD}$tsConfigEntryFile${CYAN_BRIGHT}...\n${END}"

emittedFiles=($( tsc --listEmittedFiles ))

printf "${GREEN}Created the following declaration files:\n${END}"

emittedFileNumber=1
for emittedFile in ${emittedFiles[@]}
do
    if [ $emittedFile != "TSFILE:" ]
    then
        emittedFileRelativePath=$( echo $emittedFile | grep -o "icons/.*" )
        emittedFileRelativePath=${emittedFileRelativePath:6}
        printf "${GREEN}$emittedFileNumber. ${BOLD}$emittedFileRelativePath\n${END}"
        ((emittedFileNumber=emittedFileNumber+1))
    fi
done
