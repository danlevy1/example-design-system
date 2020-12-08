const request = require("request");
const { promisify } = require("util");
const requestPromise = promisify(request);
const executeShellCommand = require("../scripts/executeShellCommand");
// const chalk = require("chalk");

const getChangedPackages = async () => {
    try {
        const stdout = await executeShellCommand(
            "./node_modules/.bin/lerna changed"
        );

        const changedPackages = stdout
            .split("\n")
            .filter((packageName) => packageName !== "");

        return changedPackages;
    } catch (e) {
        if (e.stderr.includes("No changed packages found")) {
            const changedPackages = [];

            return changedPackages;
        }

        throw e;
    }
};

const triggerWorkflows = async () => {
    const changedPackages = await getChangedPackages();

    const parametersObject = { parameters: { "trigger-workflows": false } };

    changedPackages.forEach((changedPackage) => {
        const changedPackageWithoutScope = changedPackage.substring(
            changedPackage.indexOf("/") + 1
        );
        parametersObject.parameters[`run-${changedPackageWithoutScope}`] = true;
    });

    const options = {
        method: "POST",
        url: `https://circleci.com/api/v2/project/gh/danlevy1/example-design-system/pipeline?circle-token=${process.env.CIRCLECI_API_TOKEN}`,
        headers: {
            "content-type": "application/json",
        },
        body: parametersObject,
        json: true,
    };

    const response = await requestPromise(options);

    if (!String(response.statusCode).startsWith("2")) {
        throw new Error(
            `CircleCI workflow trigger returned a bad status code: ${response.statusCode}. ${response.body}`
        );
    }

    console.log(
        "Workflow(s) triggered for the following packages:",
        changedPackages.split(", ")
    );
};

triggerWorkflows();
