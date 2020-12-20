#!/bin/bash
set -e

getChangedPackages () {
    local changedPackages=()
    local packageNames=($( ls ./packages ))

    for i in "${packageNames[@]}"
    do
        local output=$( git diff origin/main -- ./packages/$i )
        
        if [[ $output ]]
        then
            changedPackages+=($i)
        fi
    done

    echo ${changedPackages[@]}
}

args=("$@")
circle_token=${args[0]}
git_branch_name=${args[1]}

echo $circle_token
echo $git_branch_name

changedPackages=($(getChangedPackages))

if [ -z "$changedPackages" ]
then
    echo None of the packages have changed. Skipping package workflows.
    exit 0
fi

parameters=$( jq -nc '{"trigger-workflows": false} | .[$ARGS.positional[]] = true' --args "${changedPackages[@]/#/run-}" )

triggerPipelineRequestBody=$( jq -nc \
                                 --argjson parameters "$parameters" \
                                 --arg git_branch_name "$git_branch_name" \
                                 '{branch: $git_branch_name, parameters: $parameters}' )


response=$( curl --silent --write-out "\nhttp_code:%{http_code}" --request POST \
    --url https://circleci.com/api/v2/project/gh/danlevy1/example-design-system/pipeline \
    --header "Circle-Token: $circle_token" \
    --header "content-type: application/json" \
    --data "$triggerPipelineRequestBody" )

responseMessage=${response%http_code:*}
responseStatusCode=${response##*http_code:}

if [[ $responseStatusCode != 2* ]]
then
    echo "CircleCI pipeline trigger returned a bad status code: $responseStatusCode"
    echo Response: $responseMessage
    exit 1
fi

echo "Workflow(s) triggered for the following package(s): ${changedPackages[*]}"
