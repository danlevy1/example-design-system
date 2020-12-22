#!/bin/bash
set -e

# Description: Prints a warning to the command line about using `console.log` in tests.

# Command line output formats
YELLOW='\033[0;33m'
END='\e[0m'

printf "${YELLOW}|---------------------------------------------------------------------------------------------------------------------------------|\n${YELLOW}| !! Some test files mock console.log, so you might need to use the original console.log for the log to appear in the terminal !! |\n${YELLOW}|---------------------------------------------------------------------------------------------------------------------------------|\n\n${END}"
