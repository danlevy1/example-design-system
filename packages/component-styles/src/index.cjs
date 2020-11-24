const { resolve } = require("path");
const { buildDesignTokens, PlatformOptions } = require("@x3r5e/design-tokens");

const DIRNAME = __dirname;

const platformsTest = [
    {
        name: PlatformOptions.CSS,
        destinationPath: `${resolve(DIRNAME, "./tokens")}/`,
        destinationFilename: "variables.css",
    },
    {
        name: PlatformOptions.SCSS,
        destinationPath: `${resolve(DIRNAME, "./tokens")}/`,
        destinationFilename: "variables.scss",
    },
    {
        name: PlatformOptions.LESS,
        destinationPath: `${resolve(DIRNAME, "./tokens")}/`,
        destinationFilename: "variables.less",
    },
    {
        name: PlatformOptions.JS,
        destinationPath: `${resolve(DIRNAME, "./tokens")}/`,
        destinationFilename: "variables.js",
    },
];

buildDesignTokens(platformsTest);
