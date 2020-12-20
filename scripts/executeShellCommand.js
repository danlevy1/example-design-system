const { promisify } = require("util");
const exec = promisify(require("child_process").exec);

const executeShellCommand = async (command) => {
    const { stdout, stderr } = await exec(command);

    return [stdout, stderr];
};

module.exports = executeShellCommand;
