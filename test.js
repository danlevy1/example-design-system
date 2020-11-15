const { resolve } = require("path");
const buildDesignTokens = require("./scripts/buildDesignTokens.js");

const platformsTest = [
    {
        name: "css",
        destinationPath: `${resolve(__dirname, "../tokens")}/`,
        destinationFilename: "variables.css",
    },
    {
        name: "scss",
        destinationPath: `${resolve(__dirname, "../tokens")}/`,
        destinationFilename: "variables.scss",
    },
    {
        name: "less",
        destinationPath: `${resolve(__dirname, "../tokens")}/`,
        destinationFilename: "variables.less",
    },
    {
        name: "js",
        destinationPath: `${resolve(__dirname, "../tokens")}/`,
        destinationFilename: "variables.js",
    },
];

buildDesignTokens(platformsTest);
