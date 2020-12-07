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
    }
};

const triggerWorkflows = async () => {
    const changedPackages = await getChangedPackages();

    const parameters = {};

    changedPackages.forEach((changedPackage) => {
        parameters[`run-${changedPackage}`] = true;
    });

    // const options = {
    //     method: "POST",
    //     url:
    //         "https://circleci.com/api/v2/project/github/danlevy1/example-design-system/pipeline",
    //     headers: {
    //         "content-type": "application/json",
    //         authorization: "Basic Circle-Token: $CIRCLECI_PERSONAL_TOKEN",
    //     },
    //     body: JSON.stringify(parameters),
    //     json: true,
    // };

    // const response = await requestPromise(options);
    // console.log(response.body, response.statusCode);

    const stdout = await executeShellCommand(
        "curl --request GET \
        --url 'https://circleci.com/api/v2/project/gh/danlevy1/example-design-system/pipeline?circle-token=$CIRCLECI_TOKEN' \
        --header 'accept: application/json'"
    );

    console.log(stdout);
};

triggerWorkflows();
