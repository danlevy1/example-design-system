const executeShellCommand = require("./executeShellCommand");
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
    } catch (e) {
        if (!e.stderr.includes("No changed packages found")) {
            console.error(e);
        } else {
            console.log("Changed Packages:", []);
        }
    }
};

getChangedPackages();
