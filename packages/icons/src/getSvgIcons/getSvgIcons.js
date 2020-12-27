const { resolve } = require("path");
const { readFile, readdir } = require("fs/promises");

/**
 * Retrieves all of the SVG icons.
 * @param {string=} absolutePathToSvgDirectory - The absolute path the the directory containing the SVG files. Defaults to the `dist/assets` directory of this package.
 * @returns {Promise<Map<string, string> | Error>} A map of SVGs (key is the icon name; value is the SVG), or an error
 */
const getSvgIcons = async (
    absolutePathToSvgDirectory = resolve(__dirname, "./assets")
) => {
    const iconFileNames = await readdir(absolutePathToSvgDirectory);

    const svgIcons = new Map();

    await Promise.all(
        iconFileNames
            .filter((iconFileName) => /.svg$/.test(iconFileName))
            .map(async (iconFileName) => {
                const iconName = iconFileName.substring(
                    0,
                    iconFileName.lastIndexOf(".")
                );
                const svgIcon = await readFile(
                    `${absolutePathToSvgDirectory}/${iconFileName}`,
                    { encoding: "utf-8" }
                );

                svgIcons.set(iconName, svgIcon);
            })
    );

    return svgIcons;
};

module.exports = { getSvgIcons };
