const request = require("request");
const { promisify } = require("util");
const { readdir } = require("fs").promises;
const requestPromise = promisify(request);
const executeShellCommand = require("../scripts/executeShellCommand");

const getChangedPackages = async () => {
    const packageNames = await readdir("./packages");

    const changedPackages = [];

    packageNames.forEach(async (packageName) => {
        const stdout = await executeShellCommand(
            `git diff main -- packages/${packageName}`
        );

        if (stdout === "") {
            changedPackages.push(packageName);
        }
    });

    return changedPackages;

    // try {
    //     const stdout = await executeShellCommand(
    //         "./node_modules/.bin/lerna changed"
    //     );

    //     const changedPackages = stdout
    //         .split("\n")
    //         .filter((packageName) => packageName !== "");

    //     return changedPackages;
    // } catch (e) {
    //     if (e.stderr.includes("No changed packages found")) {
    //         const changedPackages = [];

    //         return changedPackages;
    //     }

    //     throw e;
    // }

    // git diff main -- packages/design-tokens
};

// getChangedPackages().then((x) => console.log(x));

const triggerWorkflows = async () => {
    const changedPackages = await getChangedPackages();

    const parametersObject = { parameters: { "trigger-workflows": false } };

    changedPackages.forEach((changedPackage) => {
        // const changedPackageWithoutScope = changedPackage.substring(
        //     changedPackage.indexOf("/") + 1
        // );
        parametersObject.parameters[`run-${changedPackage}`] = true;
    });

    const options = {
        method: "POST",
        url: `https://circleci.com/api/v2/project/gh/danlevy1/example-design-system/pipeline`,
        headers: {
            "content-type": "application/json",
            "Circle-Token": process.env.CIRCLECI_API_TOKEN,
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
        "Workflow(s) triggered for the following package(s):",
        changedPackages.join()
    );
};

triggerWorkflows();
