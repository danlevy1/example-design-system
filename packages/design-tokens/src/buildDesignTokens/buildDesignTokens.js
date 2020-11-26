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
    ESM: "esm",
    CJS: "cjs",
    JSON: "json",
};

const PLATFORM_FORMATS_MAP = new Map([
    [PlatformOptions.CSS, "css/variables"],
    [PlatformOptions.SCSS, "scss/variables"],
    [PlatformOptions.LESS, "less/variables"],
    [PlatformOptions.ESM, "javascript/es6"],
    [PlatformOptions.CJS, "javascript/cjs"],
    [PlatformOptions.JSON, "json/nested"],
]);

const PLATFORM_TRANSFORM_GROUPS_MAP = new Map([
    [PlatformOptions.CSS, "css"],
    [PlatformOptions.SCSS, "css"],
    [PlatformOptions.LESS, "css"],
    [PlatformOptions.ESM, "js"],
    [PlatformOptions.CJS, "js"],
    [PlatformOptions.JSON, "json"],
]);

/**
 * Information for the platform that the design tokens will be built for.
 * @typedef {Object} Platform
 * @property {PlatformOptions} name The platform to build design tokens for.
 * @property {String} destinationPath The absolute path to the destination directory where the design tokens file will be generated. The path does not need a trailing "/".
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
        transformGroup: PLATFORM_TRANSFORM_GROUPS_MAP.get(platform.name),
        buildPath: platform.destinationPath,
        files: [
            {
                destination: platform.destinationFilename,
                format: PLATFORM_FORMATS_MAP.get(platform.name),
            },
        ],
    };
};

const fileHeader = (options, commentStyle) => {
    var to_ret = "";
    // for backward compatibility we need to have the user explicitly hide them
    var showFileHeader = options ? options.showFileHeader : true;
    if (showFileHeader) {
        if (commentStyle === "short") {
            to_ret += "\n";
            to_ret += "// Do not edit directly\n";
            to_ret += "// Generated on " + new Date().toUTCString() + "\n";
            to_ret += "\n";
        } else {
            to_ret += "/**\n";
            to_ret += " * Do not edit directly\n";
            to_ret += " * Generated on " + new Date().toUTCString() + "\n";
            to_ret += " */\n\n";
        }
    }

    return to_ret;
};

const createTransformGroups = (styleDictionary) => {
    /*
     * Creates the CSS transform group.
     * The CSS transform group can be used for CSS pre-processors as well.
     */
    styleDictionary.registerTransformGroup({
        name: "css",
        transforms: ["attribute/cti", "name/cti/kebab"],
    });

    // Creates the JS transform group
    styleDictionary.registerTransformGroup({
        name: "js",
        transforms: ["attribute/cti", "name/cti/constant"],
    });

    // Creates the JSON transform group
    styleDictionary.registerTransformGroup({
        name: "json",
        transforms: [],
    });
};

const createFormats = (styleDictionary) => {
    // Creates the CJS format
    styleDictionary.registerFormat({
        name: "javascript/cjs",
        formatter: function (dictionary) {
            return (
                fileHeader(this.options) +
                "module.exports = {\n" +
                dictionary.allProperties
                    .map(function (prop) {
                        var to_ret_prop =
                            "  " +
                            prop.name +
                            ": " +
                            JSON.stringify(prop.value) +
                            ",";
                        if (prop.comment)
                            to_ret_prop = to_ret_prop.concat(
                                " // " + prop.comment
                            );
                        return to_ret_prop;
                    })
                    .join("\n") +
                "\n}"
            );
        },
    });
};

/**
 * Builds the design tokens for the specified platforms.
 * @param {Platform[]} platforms - The platforms that the design tokens will be built for.
 * @param {string[]=} sourcePaths - An array of property file paths. Absolute paths and path globs are accepted. See https://github.com/isaacs/node-glob for more information about globs.
 */
const buildDesignTokens = async (
    platforms,
    // The default source path is based on the production version of this file in the dist folder
    sourcePaths = [resolve(__dirname, "./properties/**/*.json")]
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
    });

    createTransformGroups(styleDictionary);

    createFormats(styleDictionary);

    const styleDictionaryWithOptions = styleDictionary.extend(
        styleDictionaryConfig
    );

    styleDictionaryWithOptions.buildAllPlatforms();
};

module.exports = {
    buildDesignTokens,
    PlatformOptions,
};
