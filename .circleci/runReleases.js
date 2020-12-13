const { readdir } = require("fs").promises;
const executeShellCommand = require("../scripts/executeShellCommand");

const getPackageVersions = async () => {
    const packageNames = await readdir("../packages");

    const packageVersions = await Promise.all(
        packageNames.map(async (packageName) => {
            const localPackage = require(`../packages/${packageName}/package.json`);

            const package = { name: packageName };
            package.localVersion = localPackage.version;

            const publishedPackageVersion = await executeShellCommand(
                `npm view @x3r5e/${packageName} version`
            ).then((publishedPackageVersion) =>
                publishedPackageVersion.replace("\n", "")
            );
            package.publishedVersion = publishedPackageVersion;

            return package;
        })
    );

    return packageVersions;
};

const getPackagesToPublish = (packageVersions) => {
    const packagesToPublish = new Map();

    packageVersions.forEach((package) => {
        if (package.localVersion !== package.publishedVersion) {
            packagesToPublish.set(
                `${"@x3r5e"}/package.name`,
                package.localVersion
            );
        }
    });

    return packagesToPublish;
};

const runReleases = async () => {
    const packageVersions = await getPackageVersions();

    const packagesToPublish = getPackagesToPublish(packageVersions);

    console.log(packagesToPublish);
};

runReleases();
