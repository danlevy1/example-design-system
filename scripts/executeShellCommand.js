const { exit } = require("process");
const { promisify } = require("util");
const exec = promisify(require("child_process").exec);

const executeShellCommand = async (command) => {
    const { stdout, stderr } = await exec(command);

    if (stderr) {
        console.log(stderr);
        exit(1);
    }

    return stdout;
};

module.exports = executeShellCommand;
