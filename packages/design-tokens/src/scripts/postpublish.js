const executeShellCommand = require("./executeShellCommand");
// const chalk = require("chalk");
const pkg = require("../../package.json");

const packageName = pkg.name;
const packageVersion = pkg.version;
const packageNameAndVersion = `${packageName}@${packageVersion}`;

const postpublish = async () => {
    await executeShellCommand("git add package.json package-lock.json");
    await executeShellCommand(`git tag ${packageNameAndVersion}`);
    await executeShellCommand(
        `git commit -m 'Publish ${packageNameAndVersion}'`
    );
    await executeShellCommand(`git push --follow-tags`);
};

postpublish();
