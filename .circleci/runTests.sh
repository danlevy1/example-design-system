#!/bin/bash
set -e

# Description: Runs tests for a package if any files in the `src` folder changed

args=("$@")
packageName=${args[0]}

# Command line output formats
CYAN_BRIGHT='\033[0;96m'
GREEN='\033[0;32m'
BOLD='\033[1m'
END='\e[0m'

# If the `git diff` command returns a diff, run the tests
diff=$( git diff origin/main -- ./packages/$packageName/src )
    
if [[ $diff ]]
then
    printf "\n\n${CYAN_BRIGHT}======== RUNNING TESTS FOR @x3r5e/$packageName ========\n${END}"
    npm test
    printf "${GREEN}======== TESTS PASSED FOR @x3r5e/$packageName ========\n\n${END}"
else
    printf "${GREEN}No changes in the src directory for ${BOLD}@x3r5e/$packageName${END}${GREEN}. Skipping tests.\n${END}"
fi


