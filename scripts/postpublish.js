const executeShellCommand = require("./executeShellCommand");
// const chalk = require("chalk");
const pkg = require(`../packages/${process.env.PACKAGE_NAME}/package.json`);

const packageName = pkg.name;
console.log(packageName);
const packageVersion = pkg.version;
const packageNameAndVersion = `${packageName}@${packageVersion}`;

const postpublish = async () => {
    let stdout;

    stdout = await executeShellCommand(
        "git add package.json package-lock.json"
    );
    console.log(stdout);

    stdout = await executeShellCommand(
        `git commit -m 'Publish ${packageNameAndVersion}'`
    );
    console.log(stdout);

    stdout = await executeShellCommand(
        `git tag -a ${packageNameAndVersion} -m "${packageNameAndVersion}"`
    );
    console.log(stdout);

    stdout = await executeShellCommand(`git push --follow-tags`);
    console.log(stdout);
};

postpublish();
