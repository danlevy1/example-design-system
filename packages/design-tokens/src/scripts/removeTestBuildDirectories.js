const globby = require("globby");
const { exec } = require("child_process");
const { resolve } = require("path");

(async () => {
    const filePaths = await globby(["src/**/build/*.test.js"]);

    filePaths.forEach((filePath) => {
        const buildDirectoryPath = filePath.substr(
            0,
            filePath.lastIndexOf("/")
        );
        const buildDirectoryAbsolutePath = resolve(
            __dirname,
            "../../",
            buildDirectoryPath
        );

        exec(
            `rm -rf ${buildDirectoryAbsolutePath}`,
            (error, stdout, stderr) => {
                if (error) {
                    console.error(error);
                } else {
                    console.log(stdout);
                    console.log(stderr);
                }
            }
        );
    });
})();
