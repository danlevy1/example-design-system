const { readdir } = require("fs").promises;
const executeShellCommand = require("../scripts/executeShellCommand");

const getPackageVersions = async () => {
    const currentPackageNames = await readdir("./packages");
    const currentPackageVersions = new Map();

    for (const packageName of currentPackageNames) {
        const pkg = require(`./packages/${packageName}/package.json`);
        currentPackageVersions.set(packageName, pkg.version);
    }

    const previousMergeCommitSha = await executeShellCommand(
        "git rev-list --min-parents=2 --max-count=1 --skip=1 HEAD"
    );

    const stdout = await executeShellCommand(
        `git checkout ${previousMergeCommitSha}`
    );
    console.log(stdout);

    const previousPackageNames = await readdir("./packages");
    const previousPackageVersions = new Map();

    for (const packageName of previousPackageNames) {
        const pkg = require(`./packages/${packageName}/package.json`);
        previousPackageVersions.set(packageName, pkg.version);
    }

    const stdout3 = await executeShellCommand("git checkout main");
    console.log(stdout3);

    return { currentPackageVersions, previousPackageVersions };
};

const getPackagesToPublish = (
    currentPackageVersions,
    previousPackageVersions
) => {
    const packagesToPublish = new Map();

    currentPackageVersions.forEach((currentPackageVersion, packageName) => {
        if (previousPackageVersions.has(packageName)) {
            const previousPackageVersion = previousPackageVersions.get(
                packageName
            );

            if (currentPackageVersion !== previousPackageVersion) {
                packagesToPublish.set(packageName, currentPackageVersion);
            }
        }
    });

    return packagesToPublish;
};

const runReleases = async () => {
    const {
        currentPackageVersions,
        previousPackageVersions,
    } = await getPackageVersions();

    const packagesToPublish = getPackagesToPublish(
        currentPackageVersions,
        previousPackageVersions
    );

    console.log(packagesToPublish);
};

runReleases();
