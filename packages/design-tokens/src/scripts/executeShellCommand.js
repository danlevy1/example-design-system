const { promisify } = require("util");
const exec = promisify(require("child_process").exec);

const executeShellCommand = async (command) => {
    const { stdout, stderr } = await exec(command);

    if (stdout) {
        console.log(stdout);
    }

    if (stderr) {
        console.log(stderr);
    }
};

module.exports = executeShellCommand;
