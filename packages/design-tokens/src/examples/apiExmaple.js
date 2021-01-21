const { resolve } = require("path");
const {
    buildDesignTokens,
    PlatformOptions,
} = require("../buildDesignTokens/buildDesignTokens");

// This array includes every platform currently offered via the API
const platforms = [
    {
        name: PlatformOptions.CSS,
        destinationPath: resolve(__dirname, "./tokens"),
        destinationFilename: "tokens.css",
    },
    {
        name: PlatformOptions.SCSS,
        destinationPath: resolve(__dirname, "./tokens"),
        destinationFilename: "tokens.scss",
    },
    {
        name: PlatformOptions.LESS,
        destinationPath: resolve(__dirname, "./tokens"),
        destinationFilename: "tokens.less",
    },
    {
        name: PlatformOptions.ESM,
        destinationPath: resolve(__dirname, "./tokens"),
        destinationFilename: "tokens.mjs",
    },
    {
        name: PlatformOptions.CJS,
        destinationPath: resolve(__dirname, "./tokens"),
        destinationFilename: "tokens.cjs",
    },
    {
        name: PlatformOptions.JSON,
        destinationPath: resolve(__dirname, "./tokens"),
        destinationFilename: "tokens.json",
    },
];

/*
    Output File Structure:
    <__dirname>
        |- tokens
            |- tokens.css
            |- tokens.scss
            |- tokens.less
            |- tokens.mjs
            |- tokens.cjs
            |- tokens.json
 */

// Builds the design tokens for each platform and outputs one file for each platform
buildDesignTokens(platforms, [resolve(__dirname, "../tokens/**/*.yaml")]);
