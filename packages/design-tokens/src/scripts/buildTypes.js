const executeShellCommand = require("../../../../scripts/executeShellCommand");
const chalk = require("chalk");
const tsconfig = require("../../tsconfig.json");

const logEmittedFiles = (emittedFilesPaths) => {
    emittedFilesPaths.forEach((emittedFilePath, index) => {
        console.log(chalk`{green ${index + 1}. {bold ${emittedFilePath}}}`);
    });

    console.log();
};

const buildTypesFiles = async () => {
    const tsConfigEntryFile = tsconfig.files[0];

    console.log(
        chalk`\n{cyanBright Generating TypeScript declaration files based on entry file {bold ${tsConfigEntryFile}}...}`
    );

    try {
        const startTime = Date.now();

        const stdout = await executeShellCommand("tsc --listEmittedFiles");

        const endTime = Date.now();
        const ellapsedTime = endTime - startTime;

        console.log(
            chalk`{green Created the following declaration files in {bold ${ellapsedTime}ms}:}`
        );

        const emittedFilePaths = stdout
            .split("\n")
            .map((emittedFilePath) =>
                emittedFilePath.substring(
                    emittedFilePath.indexOf("design-tokens/") + 14
                )
            )
            .filter((emittedFilePath) => emittedFilePath !== "");

        logEmittedFiles(emittedFilePaths);
    } catch (e) {
        console.error(e);
    }
};

buildTypesFiles();
