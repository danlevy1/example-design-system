const { resolve } = require("path");
const request = require("request");
const { promisify } = require("util");
const { readdir } = require("fs").promises;
const requestPromise = promisify(request);
const executeShellCommand = require("../scripts/executeShellCommand");

const getChangedPackages = async () => {
    const packageNames = await readdir("./packages");

    const changedPackages = [];

    for (const packageName of packageNames) {
        const stdout = await executeShellCommand(
            `git diff origin/main -- ./packages/${packageName}`
        );

        if (stdout !== "") {
            changedPackages.push(packageName);
        }
    }

    return changedPackages;
};

// getChangedPackages().then((x) => console.log(x));

const triggerWorkflows = async () => {
    const changedPackages = await getChangedPackages();

    const parameters = { parameters: { "trigger-workflows": false } };
    let numChangedPackages = 0;

    changedPackages.forEach((changedPackage) => {
        numChangedPackages++;
        parameters.parameters[`run-${changedPackage}`] = true;
    });

    if (numChangedPackages === 0) {
        console.log(
            "None of the packages have changed. Skipping package workflows."
        );
        return;
    }

    console.log("process.env.GIT_BRANCH");

    const options = {
        method: "POST",
        url: `https://circleci.com/api/v2/project/gh/danlevy1/example-design-system/pipeline`,
        headers: {
            "content-type": "application/json",
            "Circle-Token": process.env.CIRCLECI_API_TOKEN,
        },
        body: {
            branch: process.env.GIT_BRANCH,
            parameters,
        },
        json: true,
    };

    const response = await requestPromise(options);

    if (!String(response.statusCode).startsWith("2")) {
        throw new Error(
            `CircleCI workflow trigger returned a bad status code: ${
                response.statusCode
            }. ${JSON.stringify(response.body)}`
        );
    }

    console.log(
        "Workflow(s) triggered for the following package(s):",
        changedPackages.join()
    );
};

triggerWorkflows();
