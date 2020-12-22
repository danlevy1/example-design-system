#!/bin/bash
set -e

# Description: Triggers a CircleCI pipeline that runs a workflow for each package that has changed.
# A change is a diff in the code in the package's `src` directory between the current commit in the checked out branch and the the latest commit in the `main` branch.

# Returns an array of package names that have changed since the last commit to main
getChangedPackageNames () {
    local changedPackageNames=()
    local packageNames=($( ls ./packages ))

    # If the `git diff` command returns a diff, add the package name to the array of changed package names
    for packageName in "${packageNames[@]}"
    do
        local diff=$( git diff origin/main -- ./packages/$packageName/src )
        
        if [[ $diff ]]
        then
            changedPackageNames+=($packageName)
        fi
    done

    echo ${changedPackageNames[@]}
}

args=("$@")
circle_token=${args[0]}
git_branch_name=${args[1]}

changedPackageNames=($( getChangedPackageNames ))

# If none of the packages have changed, do not trigger a pipeline
if [ -z "$changedPackageNames" ]
then
    echo None of the packages have changed. Skipping package workflows.
    exit 0
fi

pipelineParameters=$( jq -nc '{"run-ci-triggers": false} | .[$ARGS.positional[]] = true' --args "${changedPackageNames[@]/#/run-}" )

triggerPipelineRequestBody=$( jq -nc \
                                 --argjson pipelineParameters "$pipelineParameters" \
                                 --arg git_branch_name "$git_branch_name" \
                                 '{branch: $git_branch_name, parameters: $pipelineParameters}' )

# Triggers a CircleCI pipeline
triggerPipelineResponse=$( curl --silent --write-out "\nhttp_code:%{http_code}" --request POST \
    --url https://circleci.com/api/v2/project/gh/danlevy1/example-design-system/pipeline \
    --header "Circle-Token: $circle_token" \
    --header "content-type: application/json" \
    --data "$triggerPipelineRequestBody" )

responseMessage=${triggerPipelineResponse%http_code:*}
responseStatusCode=${triggerPipelineResponse##*http_code:}

if [[ $responseStatusCode != 2* ]]
then
    echo "CircleCI pipeline trigger returned a bad status code: $responseStatusCode"
    echo Response: $responseMessage
    exit 1
fi

echo "Workflow(s) triggered for the following package(s): ${changedPackageNames[*]}"
