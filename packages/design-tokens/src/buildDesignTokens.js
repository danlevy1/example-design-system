const PLATFORM_OPTIONS = new Map([
    ["css", "css/variables"],
    ["scss", "scss/variables"],
    ["less", "less/variables"],
    ["js", "javascript/es6"],
]);

const styleDictionaryConfig = {
    source: ["../dist/properties.json"],
    platforms: {},
};

const validatePlatform = (platform, index) => {
    if (!platform.name) {
        throw new Error(
            `Platform at index "${index}" does not have a ${`name`} property. Each platform should be of the form ${`{name: <paltform-name>, destinationPath: <absolute-path>, destinationFilename: <filename>}`}`
        );
    }

    if (!Array.from(PLATFORM_OPTIONS.keys()).includes(platform.name)) {
        throw new Error(
            `Platform at index "${index}" has an invalid ${`name`} property. Valid names are: ${PLATFORM_OPTIONS.join(
                ","
            )}`
        );
    }

    if (!platform.destinationPath) {
        throw new Error(
            `Platform at index "${index}" does not have a ${`destinationPath`} property. Each platform should be of the form ${`{name: <paltform-name>, destinationPath: <absolute-path>, destinationFilename: <filename>}`}`
        );
    }

    if (!platform.destinationFilename) {
        throw new Error(
            `Platform at index "${index}" does not have a ${`destinationFilename`} property. Each platform should be of the form ${`{name: <paltform-name>, destinationPath: <absolute-path>, destinationFilename: <filename>}`}`
        );
    }
};

const addPlatformToConfig = (platform) => {
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

const buildDesignTokens = (platforms) => {
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
