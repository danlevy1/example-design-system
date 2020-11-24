import { resolve, dirname } from "path";
import { buildDesignTokens, PlatformOptions } from "@x3r5e/design-tokens";
import { fileURLToPath } from "url";

const getDirname = (fileURL) => {
    const DIRNAME = dirname(fileURLToPath(fileURL));
    return DIRNAME;
};

const DIRNAME = getDirname(import.meta.url);

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
