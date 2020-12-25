/*
1. Add https://www.npmjs.com/package/svgson as a dev dependency
2. Remove "width" and "height" attributes from <svg> element. Any component library (e.g. `react-components`) that ingests the icons should dynamically add the width and height attributes based on offered sizes.
3. Remove the "fill" attribute from all elements (including nested elements). If any of the elements use `stroke` attribute, throw an error because all elements need to use the `fill` attribute.
*/

const { resolve } = require("path");
const { readFile, writeFile, readdir } = require("fs/promises");
const { parse, stringify } = require("svgson");
const { exit } = require("process");
const chalk = require("chalk");

class ValidationError extends Error {
    constructor(elementName, attributeKey) {
        super();
        this.elementName = elementName;
        this.attributeKey = attributeKey;
    }
}

class EmptySvgError extends Error {
    constructor() {
        super();
    }
}

/**
 * Gets the absolute file path for each SVG file
 * @returns {Promise<Array[string]|Error>} An array of absolute file paths, or an error
 */
const getSvgAbsoluteFilePaths = async () => {
    const absolutePathToSvgDirectory = resolve(__dirname, "../../assets");

    const svgFileNames = await readdir(absolutePathToSvgDirectory);
    const absoluteFilePaths = svgFileNames.map(
        (fileName) => `${absolutePathToSvgDirectory}/${fileName}`
    );

    return absoluteFilePaths;
};

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
 *
 * @param {object} svgElement - The SVG element to validate
 * @param {"valid"|"invalid"} validationCheck - The type of validation check to do. "valid" throws an error if an element is not in the `validationAttributes` array. "invalid" throws an error if an element is in the `validationAttributes` array.
 * @param {array[string]} validationAttributes - An array of attributes to check against. The check is based off of the `validationCheck` argument.
 * @returns {void|Error}
 */
const checkForValidOrInvalidAttributes = (
    svgElement,
    validationCheck,
    validationAttributes
) => {
    for (const attributeKey of Object.keys(svgElement.attributes)) {
        let isAttributeValid;
        if (validationCheck === "valid") {
            isAttributeValid = validationAttributes.includes(attributeKey);
        } else if (validationCheck === "invalid") {
            isAttributeValid = !validationAttributes.includes(attributeKey);
        } else {
            throw new Error(
                "Invalid validationCheck value. Accepted values are 'valid' or 'invalid'."
            );
        }

        if (!isAttributeValid) {
            throw new ValidationError(svgElement.name, attributeKey);
        }
    }
};

/**
 * Formats a child element of the root <svg> element
 * @param {object} svgElement - The SVG element to format
 * @returns {void|Error}
 */
const formatSvgChildElement = (svgElement) => {
    delete svgElement.attributes.fill;

    checkForValidOrInvalidAttributes(svgElement, "invalid", ["stroke"]);
};

/**
 * Runs a DFS to format all children of an SVG
 * @param {object} svgElement - The SVG element to format
 * @returns {void|Error}
 */
const formatSvgChildElements = (svgElement) => {
    if (svgElement.children?.length > 0) {
        for (const childSvgElement of svgElement.children) {
            formatSvgChildElement(childSvgElement);
            formatSvgChildElements(childSvgElement);
        }
    }
};

/**
 * Formats the root SVG element (i.e. the <svg> element)
 * @param {object} svgElement - The root SVG element
 * @returns {void|Error}
 */
const formatSvgRootElement = (svgElement) => {
    if (!svgElement.attributes.xmlns) {
        svgElement.attributes.xmlns = "http://www.w3.org/2000/svg";
    }

    delete svgElement.attributes.width;
    delete svgElement.attributes.height;
    delete svgElement.attributes.style;
    delete svgElement.attributes.fill;

    if (svgElement.children?.length === 0) {
        throw new EmptySvgError();
    }

    checkForValidOrInvalidAttributes(svgElement, "valid", ["viewBox", "xmlns"]);
};

/**
 * Formats the SVG
 * @param {object} svgElement - The root SVG element
 * @returns {void|Error}
 */
const formatSvg = (svgElement) => {
    formatSvgRootElement(svgElement);
    formatSvgChildElements(svgElement);
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
 * @returns {Promise<void>}
 */
const formatSvgIcons = async () => {
    const absoluteFilePaths = await getSvgAbsoluteFilePaths();

    await Promise.all(
        absoluteFilePaths.map(async (filePath) => {
            try {
                const svgObject = await getSvgAsObject(filePath);
                formatSvg(svgObject);
                await writeFormattedSvgToFile(svgObject, filePath);
            } catch (error) {
                if (error instanceof ValidationError) {
                    error.message = chalk`{red SVG element {bold "${error.elementName}"} has invalid attribute {bold "${error.attributeKey}"}. Error thrown in file {bold ${filePath}}. Please remove this attribute from the element.}`;
                } else if (error instanceof EmptySvgError) {
                    error.message = chalk`{red SVG at {bold ${filePath}} does not have any children, which means that it is empty. Empty SVGs are not allowed.}`;
                }

                console.error(error);
                exit(1);
            }
        })
    );

    console.log(
        chalk`{green {bold ${absoluteFilePaths.length}} SVG files were successfully formatted}`
    );
};

formatSvgIcons();
