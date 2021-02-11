const { resolve } = require("path");
const { buildDesignTokens, PlatformOptions } = require("@x3r5e/design-tokens");

const platforms = [
    {
        name: PlatformOptions.CSS,
        destinationPath: `${resolve("./src/design-tokens")}/`,
        destinationFilename: "variables.css",
    },
];

buildDesignTokens(platforms);
