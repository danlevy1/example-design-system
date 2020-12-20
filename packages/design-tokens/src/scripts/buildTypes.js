const executeShellCommand = require("../../../../scripts/executeShellCommand");
const chalk = require("chalk");
const tsconfig = require("../../tsconfig.json");

const logEmittedFiles = (emittedFilesPaths) => {
    emittedFilesPaths.forEach((emittedFilePath, index) => {
        process.stderr.write(
            chalk`{green ${index + 1}. {bold ${emittedFilePath}}}\n`
        );
    });

    process.stderr.write("\n");
};

const buildTypesFiles = async () => {
    const tsConfigEntryFile = tsconfig.files[0];

    process.stderr.write(
        chalk`\n{cyanBright Generating TypeScript declaration files based on entry file {bold ${tsConfigEntryFile}}...}\n`
    );

    try {
        const startTime = Date.now();

        const [stdout] = await executeShellCommand(
            "tsc --listEmittedFiles",
            true
        );

        const endTime = Date.now();
        const ellapsedTime = endTime - startTime;

        process.stderr.write(
            chalk`{green Created the following declaration files in {bold ${ellapsedTime}ms}:}\n`
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
