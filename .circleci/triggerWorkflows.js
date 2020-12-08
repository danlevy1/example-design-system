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

        console.log("Changed Packages:", changedPackages);

        return changedPackages;
    } catch (e) {
        if (e.stderr.includes("No changed packages found")) {
            const changedPackages = [];
            console.log("Changed Packages:", changedPackages);

            return changedPackages;
        }

        throw e;
    }
};

const triggerWorkflows = async () => {
    const changedPackages = await getChangedPackages();

    const parametersObject = { parameters: {} };

    changedPackages.forEach((changedPackage) => {
        const changedPackageWithoutScope = changedPackage.substring(
            changedPackage.indexOf("/") + 1
        );
        parametersObject.parameters[`run-${changedPackageWithoutScope}`] =
            "true";
    });

    console.log(parametersObject);

    const options = {
        method: "POST",
        url: `https://circleci.com/api/v2/project/gh/danlevy1/example-design-system/pipeline?circle-token=${process.env.CIRCLECI_TOKEN}`,
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify(parametersObject),
        json: true,
    };

    const response = await requestPromise(options);
    console.log(response.body, response.statusCode);
};

triggerWorkflows();
