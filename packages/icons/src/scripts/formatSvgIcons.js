/*
1. Add https://www.npmjs.com/package/svgson as a dev dependency
2. Remove "width" and "height" attributes from <svg> element. Any component library (e.g. `react-components`) that ingests the icons should dynamically add the width and height attributes based on offered sizes.
3. Remove the "fill" attribute from all elements (including nested elements). If any of the elements use `stroke` attribute, throw an error because all elements need to use the `fill` attribute.
*/

const { resolve } = require("path");
const { readFile, writeFile, readdir } = require("fs/promises");
const { parse, stringify } = require("svgson");

/**
 * Converts an SVG file into an AST as a JS object
 * @param {string} absoluteFilePath - The absolute path to the SVG file
 * @returns {Promise<string | Error>} The SVG as an objct, or an error
 */
const getSvgAsObject = async (absoluteFilePath) => {
    const svgContent = await readFile(absoluteFilePath, { encoding: "utf-8" });
    const svgAsObject = await parse(svgContent);

    return svgAsObject;
};

/**
 * Gets the absolute file path for each SVG file
 * @returns {Promise<Array[string]|Error>} An array of absolute file paths, or an error
 */
const getSvgAbsoluteFilePaths = async () => {
    const absolutePathToSvgDirectory = resolve(__dirname, "../../assets/svg");

    const svgFileNames = await readdir(absolutePathToSvgDirectory);
    const absoluteFilePaths = svgFileNames.map(
        (fileName) => `${absolutePathToSvgDirectory}/${fileName}`
    );

    return absoluteFilePaths;
};

/**
 *
 * @param {object} svgElement - The SVG element to validate
 * @param {"valid"|"invalid"} validationCheck - The type of validation check to do. "valid" throws an error if an element is not in the `validationAttributes` array. "invalid" throws an error if an element is in the `validationAttributes` array.
 * @param {string} absoluteFilePath - The absolute path to the SVG file
 * @param {array[string]} validationAttributes - An array of attributes to check against. The check is based off of the `validationCheck` argument.
 * @returns {void|Error}
 */
const checkForValidOrInvalidAttributes = (
    svgElement,
    validationCheck,
    absoluteFilePath,
    validationAttributes
) => {
    for (const [attributeName, attributeValue] of Object.entries(
        svgElement.attributes
    )) {
        let isAttributeValid;
        if (validationCheck === "valid") {
            isAttributeValid = validationAttributes.includes(attributeName);
        } else if (validationCheck === "invalid") {
            isAttributeValid = !validationAttributes.includes(attributeName);
        } else {
            throw new Error(
                "Invalid validationCheck value. Accepted values are 'valid' or 'invalid'."
            );
        }

        if (!isAttributeValid) {
            throw new Error(
                `SVG element ${
                    svgElement.name
                } at ${absoluteFilePath} has an invalid attribute: ${attributeName}: ${attributeValue}. The only valid attributes for this element are ${validationAttributes.join(
                    ", "
                )}.`
            );
        }
    }
};

/**
 * Formats a child element of the root <svg> element
 * @param {object} svgElement - The SVG element to format
 * @param {string} absoluteFilePath - The absolute path to the SVG file
 * @returns {void|Error}
 */
const formatSvgChildElement = (svgElement, absoluteFilePath) => {
    delete svgElement.attributes.fill;

    checkForValidOrInvalidAttributes(svgElement, "invalid", absoluteFilePath, [
        "stroke",
    ]);
};

/**
 * Formats the root SVG element (i.e. the <svg> element)
 * @param {object} svgElement - The root SVG element
 * @param {string} absoluteFilePath - The absolute path to the SVG file
 * @returns {void|Error}
 */
const formatSvgRootElement = (svgElement, absoluteFilePath) => {
    if (!svgElement.attributes.xmlns) {
        svgElement.attributes.xmlns = "http://www.w3.org/2000/svg";
    }

    delete svgElement.attributes.width;
    delete svgElement.attributes.height;
    delete svgElement.attributes.style;
    delete svgElement.attributes.fill;

    checkForValidOrInvalidAttributes(svgElement, "valid", absoluteFilePath, [
        "viewBox",
        "xmlns",
    ]);
};

/**
 * Runs a DFS to format all children of an SVG
 * @param {object} svgElement - The SVG element to format
 * @param {string} absoluteFilePath - The absolute path to the SVG file
 * @returns {void|Error}
 */
const formatSvgChildElements = (svgElement, absoluteFilePath) => {
    if (svgElement.children?.length > 0) {
        for (const childSvgElement of svgElement.children) {
            formatSvgChildElement(childSvgElement, absoluteFilePath);
            formatSvgChildElements(childSvgElement, absoluteFilePath);
        }
    } else if (svgElement.name === "svg") {
        throw new Error(
            `SVG at ${absoluteFilePath} does not have any children, which means that it is empty. Empty SVGs are not allowed.`
        );
    }
};

/**
 * Formats the SVG
 * @param {object} svgElement - The root SVG element
 * @param {*} absoluteFilePath - The absolute path to the SVG file
 * @returns {void|Error}
 */
const formatSvg = (svgElement, absoluteFilePath) => {
    formatSvgRootElement(svgElement, absoluteFilePath);
    formatSvgChildElements(svgElement, absoluteFilePath);
};

/**
 * Writes the formatted SVG to its original file
 * @param {object} svgObject - The formatted SVG object
 * @param {string} absoluteFilePath - The absolute path to the SVG file
 * @returns {Promise<void|Error>}
 */
const writeFormattedSvgToFile = async (svgObject, absoluteFilePath) => {
    const svgContent = stringify(svgObject);
    await writeFile(absoluteFilePath, svgContent);
};

/**
 * Formats all SVGs
 * @returns {Promise<void|Error>}
 */
const formatSvgIcons = async () => {
    const absoluteFilePaths = await getSvgAbsoluteFilePaths();

    await Promise.all(
        absoluteFilePaths.map(async (filePath) => {
            const svgObject = await getSvgAsObject(filePath);
            formatSvg(svgObject, filePath);
            await writeFormattedSvgToFile(svgObject, filePath);
        })
    );
};

formatSvgIcons();
