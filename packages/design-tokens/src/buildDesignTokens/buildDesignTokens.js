// dirname is used during the build process for the ESM output (see replace plugin in Rollup config)
/* eslint-disable-next-line no-unused-vars */
const { resolve, dirname } = require("path");
// fileURLToPath is used during the build process for the ESM output (see replace plugin in Rollup config)
/* eslint-disable-next-line no-unused-vars */
const { fileURLToPath } = require("url");
const styleDictionary = require("style-dictionary");

/**
 * Platforms that design tokens can be built for.
 * @readonly
 * @enum {String}
 */
const PlatformOptions = {
    CSS: "css",
    SCSS: "scss",
    LESS: "less",
    JS: "js",
};

const PLATFORM_FORMATS_MAP = new Map([
    [PlatformOptions.CSS, "css/variables"],
    [PlatformOptions.SCSS, "scss/variables"],
    [PlatformOptions.LESS, "less/variables"],
    [PlatformOptions.JS, "javascript/es6"],
]);

/**
 * Information for the platform that the design tokens will be built for.
 * @typedef {Object} Platform
 * @property {PlatformOptions} name The platform to build design tokens for.
 * @property {String} destinationPath The absolute path to the destination directory where the design tokens file will be generated. The path needs a trailing "/".
 * @property {String} destinationFilename The filename for the generated design tokens.
 */

/**
 * Throws an error if any of the platform properites are invalid.
 * @param {Platform} platform - The platform that the design tokens will be built for.
 * @param {Number} platformIndex - The index of the given platform in the platforms array.
 * @returns An error if there is an invalid property, or undefined if all properties are valid.
 */
const validatePlatform = (platform, platformIndex) => {
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
        console.warn(
            `The ${`destinationPath`} property for platform at index "${platformIndex}" should have a trailing slash (i.e. a "/" as the last character in the path). We added a trailing slash for you, but we recommend adding it yourself.`
        );
        platform.destinationPath += "/";
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
 * Adds the given platform to the design token build config.
 * @param {Platform} platform - The platform that the design tokens will be built for.
 * @param {Object} config - The Style Dictionary config.
 */
const addPlatformToConfig = (platform, config) => {
    config.platforms[platform.name] = {
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
 * Builds the design tokens for the specified platforms.
 * @param {Platform[]} platforms - The platforms that the design tokens will be built for.
 * @param {string[]=} sourcePaths - An array of property file paths. Absolute paths and path globs are accepted. See https://github.com/isaacs/node-glob for more information about globs.
 */
const buildDesignTokens = async (
    platforms,
    sourcePaths = [resolve(__dirname, "./properties.json")]
) => {
    const styleDictionaryConfig = {
        source: sourcePaths,
        platforms: {},
    };

    if (!platforms) {
        throw new Error("No platforms were provided.");
    }

    if (!Array.isArray(platforms)) {
        throw new Error(
            "The value provided to `platforms` is not of type array."
        );
    }

    if (!Array.isArray(sourcePaths)) {
        throw new Error(
            "The value provided `sourcePaths` is not of type array."
        );
    }

    platforms.forEach((platform, index) => {
        validatePlatform(platform, index);
        addPlatformToConfig(platform, styleDictionaryConfig);

        // Creates a JS transform group
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

module.exports = {
    buildDesignTokens,
    PlatformOptions,
};
