import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { buildDesignTokens } from "@x3r5e/design-tokens";

const __dirname = dirname(fileURLToPath(import.meta.url));

const platformsTest = [
    {
        name: "css",
        destinationPath: `${resolve(__dirname, "./src/tokens")}/`,
        destinationFilename: "variables.css",
    },
    {
        name: "scss",
        destinationPath: `${resolve(__dirname, "./src/tokens")}/`,
        destinationFilename: "variables.scss",
    },
    {
        name: "less",
        destinationPath: `${resolve(__dirname, "./src/tokens")}/`,
        destinationFilename: "variables.less",
    },
    {
        name: "js",
        destinationPath: `${resolve(__dirname, "./src/tokens")}/`,
        destinationFilename: "variables.js",
    },
];

buildDesignTokens(platformsTest);
