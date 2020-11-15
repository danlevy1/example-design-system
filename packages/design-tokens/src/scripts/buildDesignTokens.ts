const { resolve } = require("path");

const PLATFORM_OPTIONS = new Map([
    ["css", "css/variables"],
    ["scss", "scss/variables"],
    ["less", "less/variables"],
    ["js", "javascript/es6"],
]);

interface Platform {
    name: string;
    destinationPath: string;
    destinationFilename: string;
}

interface StyleDictionaryConfig {
    source: string[];
    platforms: {
        [platformName: string]: any;
    };
}

const styleDictionaryConfig: StyleDictionaryConfig = {
    source: [resolve(__dirname, "properties.json")],
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

    if (!Array.from(PLATFORM_OPTIONS.keys()).includes(platform.name)) {
        throw new Error(
            `Platform at index "${platformIndex}" has an invalid ${`name`} property. Valid names are: ${Array.from(
                PLATFORM_OPTIONS.keys()
            ).join(",")}`
        );
    }

    if (!platform.destinationPath) {
        throw new Error(
            `Platform at index "${platformIndex}" does not have a ${`destinationPath`} property. Each platform should be of the form ${`{name: <paltform-name>, destinationPath: <absolute-path>, destinationFilename: <filename>}`}`
        );
    }

    if (!platform.destinationFilename) {
        throw new Error(
            `Platform at index "${platformIndex}" does not have a ${`destinationFilename`} property. Each platform should be of the form ${`{name: <paltform-name>, destinationPath: <absolute-path>, destinationFilename: <filename>}`}`
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
                format: PLATFORM_OPTIONS.get(platform.name),
            },
        ],
    };
};

/**
 * Builds the design tokens for the specified platforms
 * @param platforms The platforms that the design tokens will be built for
 */
const buildDesignTokens = (platforms: Platform[]) => {
    platforms.forEach((platform, index) => {
        validatePlatform(platform, index);
        addPlatformToConfig(platform);
    });

    const StyleDictionary = require("style-dictionary").extend(
        styleDictionaryConfig
    );

    StyleDictionary.registerTransformGroup({
        name: "js",
        transforms: [
            "attribute/cti",
            "name/cti/constant",
            "size/rem",
            "color/hex",
        ],
    });

    StyleDictionary.buildAllPlatforms();
};

module.exports = buildDesignTokens;
