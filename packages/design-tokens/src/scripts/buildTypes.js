const executeShellCommand = require("./executeShellCommand");
const chalk = require("chalk");
const tsconfig = require("../../tsconfig.json");

const logTsconfigBuildInfo = () => {
    console.log();

    tsconfig.files.forEach((file) => {
        // The first line of the template literal is pushed to the left to remove whitespace when logged to the terminal
        console.log(chalk`
{green {bold ${file}} → {bold ${
            tsconfig.compilerOptions.declarationDir
        }/${file.substring(
            file.lastIndexOf("/") + 1,
            file.lastIndexOf(".")
        )}.d.ts}}
        `);
    });

    console.log(
        chalk.cyanBright.bold(
            "Type files for imported files may have also been created.\n"
        )
    );
};

const buildTypesFiles = async () => {
    try {
        await executeShellCommand("tsc");
        logTsconfigBuildInfo();
    } catch (e) {
        console.error(e);
    }
};

buildTypesFiles();
