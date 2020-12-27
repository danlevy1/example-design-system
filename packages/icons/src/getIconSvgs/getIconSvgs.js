const { resolve } = require("path");
const { readFile, readdir } = require("fs/promises");

/**
 * Retrieves all of the SVG icons.
 * @param {string=} absolutePathToSvgDirectory - The absolute path the the directory containing the SVG files. Defaults to the `dist/assets` directory of this package.
 * @returns {Promise<Map<string, string> | Error>} A map of SVGs (key is the icon name; value is the SVG), or an error
 */
const getIconSvgs = async (
    absolutePathToSvgDirectory = resolve(__dirname, "./assets")
) => {
    const iconFileNames = await readdir(absolutePathToSvgDirectory);

    const iconSvgs = new Map();

    await Promise.all(
        iconFileNames
            .filter((iconFileName) => /.svg$/.test(iconFileName))
            .map(async (iconFileName) => {
                const iconName = iconFileName.substring(
                    0,
                    iconFileName.lastIndexOf(".")
                );
                const iconSvg = await readFile(
                    `${absolutePathToSvgDirectory}/${iconFileName}`,
                    { encoding: "utf-8" }
                );

                iconSvgs.set(iconName, iconSvg);
            })
    );

    return iconSvgs;
};

module.exports = { getIconSvgs };
