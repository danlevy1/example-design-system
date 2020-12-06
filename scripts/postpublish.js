const executeShellCommand = require("./executeShellCommand");
// const chalk = require("chalk");
const pkg = require(`../packages/${process.env.PACKAGE_NAME}/package.json`);

const packageName = pkg.name;
console.log(packageName);
const packageVersion = pkg.version;
const packageNameAndVersion = `${packageName}@${packageVersion}`;

const postpublish = async () => {
    await executeShellCommand("git add package.json package-lock.json");
    await executeShellCommand(
        `git tag -a ${packageNameAndVersion} -m "Release ${packageNameAndVersion}"`
    );
    await executeShellCommand(
        `git commit -m 'Publish ${packageNameAndVersion}'`
    );
    await executeShellCommand(`git push --follow-tags`);
};

postpublish();
