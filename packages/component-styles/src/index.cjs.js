// NOTE: Remove "type": "module" from `package.json` before importing or running this file
const { resolve } = require("path");
const { buildDesignTokens } = require("@x3r5e/design-tokens/dist/index.js");

const DIRNAME = __dirname;

const platformsTest = [
    {
        name: "css",
        destinationPath: `${resolve(DIRNAME, "./tokens")}/`,
        destinationFilename: "variables.css",
    },
    {
        name: "scss",
        destinationPath: `${resolve(DIRNAME, "./tokens")}/`,
        destinationFilename: "variables.scss",
    },
    {
        name: "less",
        destinationPath: `${resolve(DIRNAME, "./tokens")}/`,
        destinationFilename: "variables.less",
    },
    {
        name: "js",
        destinationPath: `${resolve(DIRNAME, "./tokens")}/`,
        destinationFilename: "variables.js",
    },
];

buildDesignTokens(platformsTest);
