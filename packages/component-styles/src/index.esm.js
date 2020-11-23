// NOTE: Add "type": "module" to `package.json` before importing or running this file
import { resolve, dirname } from "path";
import { buildDesignTokens } from "@x3r5e/design-tokens/dist/index.esm.js";
import { fileURLToPath } from "url";

const getDirname = (fileURL) => {
    const DIRNAME = dirname(fileURLToPath(fileURL));
    return DIRNAME;
};

const DIRNAME = getDirname(import.meta.url);

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
