const { resolve } = require("path");
const { buildDesignTokens, PlatformOptions } = require("@x3r5e/design-tokens");

const platforms = [
    {
        name: PlatformOptions.SCSS,
        destinationPath: `${resolve("./src/design-tokens")}/`,
        destinationFilename: "_variables.scss",
    },
];

buildDesignTokens(platforms);
