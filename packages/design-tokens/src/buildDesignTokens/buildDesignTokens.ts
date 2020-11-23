import { resolve } from "path";
import styleDictionary from "style-dictionary";
import getDirname from "../utils/dirname.js";

const DIRNAME = getDirname(import.meta.url);

export enum PlatformOptions {
    CSS = "css",
    SCSS = "scss",
    LESS = "less",
    JS = "js",
}

export const PLATFORM_FORMATS_MAP = new Map([
    [PlatformOptions.CSS, "css/variables"],
    [PlatformOptions.SCSS, "scss/variables"],
    [PlatformOptions.LESS, "less/variables"],
    [PlatformOptions.JS, "javascript/es6"],
]);

export interface Platform {
    name: PlatformOptions;
    destinationPath: string;
    destinationFilename: string;
}

interface StyleDictionaryConfig {
    source: string[];
    platforms: {
        [platformName: string]: any;
    };
}

export const styleDictionaryConfig: StyleDictionaryConfig = {
    source: [resolve(DIRNAME, "./properties.json")],
    platforms: {},
};

/**
 * Throws an error if any of the platform properites are invalid
 * @param platform - The platform that the design tokens will be built for
 * @param platformIndex - The index of the given platform in the platforms array
 * @returns An error if there is an invalid property, or undefined if all properties are valid
 */
const validatePlatform = (platform: Platform, platformIndex: number) => {
    if (!platform.name) {
        throw new Error(
            `Platform at index "${platformIndex}" does not have a ${`name`} property. Each platform should be of the form ${`{name: <paltform-name>, destinationPath: <absolute-path>, destinationFilename: <filename>}`}`
        );
    }

    if (!Object.values(PlatformOptions).includes(platform.name)) {
        throw new Error(
            `Platform at index "${platformIndex}" has an invalid ${`name`} property. Valid names are: ${Object.values(
                PlatformOptions
            ).join(",")}`
        );
    }

    if (!platform.destinationPath) {
        throw new Error(
            `Platform at index "${platformIndex}" does not have a ${`destinationPath`} property. Each platform should be of the form ${`{name: <paltform-name>, destinationPath: <absolute-path>, destinationFilename: <filename>}`}`
        );
    }

    const destinationPathLastCharacterIndex =
        platform.destinationPath.length - 1;
    const isTrailingSlashInDestinationPath =
        platform.destinationPath.charAt(destinationPathLastCharacterIndex) ===
        "/";

    if (!isTrailingSlashInDestinationPath) {
        throw new Error(
            `Platform at index "${platformIndex}" has an invalid ${`destinationPath`} property. The ${`destinationPath`} property should have a trailing slash (i.e. a "/" as the last character in the path).`
        );
    }

    if (!platform.destinationFilename) {
        throw new Error(
            `Platform at index "${platformIndex}" does not have a ${`destinationFilename`} property. Each platform should be of the form ${`{name: <paltform-name>, destinationPath: <absolute-path>, destinationFilename: <filename>}`}`
        );
    }

    const isSlashInDestinationFilename = platform.destinationFilename.includes(
        "/"
    );

    if (isSlashInDestinationFilename) {
        throw new Error(
            `Platform at index "${platformIndex}" has an invalid ${`destinationFilename`} property. The ${`destinationFilename`} property should not have a "/". The path to the filename should be included in the ${`destinationPath`} property.`
        );
    }
};

/**
 * Adds the given platform to the design token build config
 * @param platform - The platform that the design tokens will be built for
 */
const addPlatformToConfig = (platform: Platform) => {
    styleDictionaryConfig.platforms[platform.name] = {
        transformGroup: platform.name,
        buildPath: platform.destinationPath,
        files: [
            {
                destination: platform.destinationFilename,
                format: PLATFORM_FORMATS_MAP.get(platform.name),
            },
        ],
    };
};

/**
 * Builds the design tokens for the specified platforms
 * @param platforms The platforms that the design tokens will be built for
 */
export const buildDesignTokens = async (platforms: Platform[]) => {
    platforms.forEach((platform, index) => {
        validatePlatform(platform, index);
        addPlatformToConfig(platform);

        if (platform.name === PlatformOptions.JS) {
            styleDictionary.registerTransformGroup({
                name: "js",
                transforms: [
                    "attribute/cti",
                    "name/cti/constant",
                    "size/rem",
                    "color/hex",
                ],
            });
        }
    });

    const styleDictionaryWithOptions = styleDictionary.extend(
        styleDictionaryConfig
    );

    styleDictionaryWithOptions.buildAllPlatforms();
};
