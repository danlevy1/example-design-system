/*
1. Add https://www.npmjs.com/package/svgson as a dev dependency
2. Remove "width" and "height" attributes from <svg> element. Any component library (e.g. `react-components`) that ingests the icons should dynamically add the width and height attributes based on offered sizes.
3. Remove the "fill" attribute from all elements (including nested elements). If any of the elements use `stroke` attribute, throw an error because all elements need to use the `fill` attribute.
*/

const { resolve } = require("path");
const { readFile, writeFile, readdir } = require("fs/promises");
const { parse, stringify } = require("svgson");
const chalk = require("chalk");

class InvalidAttributeError extends Error {
    constructor(elementName, attributeKey) {
        super();
        this.elementName = elementName;
        this.attributeKey = attributeKey;
    }
}

class MissingRequiredAttributeError extends InvalidAttributeError {
    constructor(elementName, attributeKey) {
        super(elementName, attributeKey);
    }
}

class EmptySvgError extends Error {
    constructor() {
        super();
    }
}

/**
 * Gets the absolute file path for each SVG file
 * @param {String=} absolutePathToSvgDirectory - The absolute path the the directory containing the SVG files. Defaults to the "assets" directory in the "icons" package.
 * @returns {Promise<Array[string]|Error>} An array of absolute file paths, or an error
 */
const getSvgAbsoluteFilePaths = async (
    absolutePathToSvgDirectory = resolve(__dirname, "../../assets")
) => {
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
    const svgObject = await parse(svgContent);

    return svgObject;
};

/**
 * Throws an error if the SVG element is missing a required attribute.
 * @param {object} svgElement - The SVG element to validate
 * @param {array[string]} requiredAttributes - An array of required attributes to check against
 * @returns {void|Error}
 */
const checkForRequiredAttributes = (svgElement, requiredAttributes) => {
    for (const requiredAttribute of requiredAttributes) {
        if (!Object.keys(svgElement.attributes).includes(requiredAttribute)) {
            throw new MissingRequiredAttributeError(
                svgElement.name,
                requiredAttribute
            );
        }
    }
};

/**
 * Throws an error if the SVG element has an invalid attribute.
 * @param {object} svgElement - The SVG element to validate
 * @param {array[string]} invalidAttributes - An array of invalid attributes to check against
 * @returns {void|Error}
 */
const checkForInvalidAttributesUsingInvalidAttributesArray = (
    svgElement,
    invalidAttributes
) => {
    for (const attributeKey of Object.keys(svgElement.attributes)) {
        if (invalidAttributes.includes(attributeKey)) {
            throw new InvalidAttributeError(svgElement.name, attributeKey);
        }
    }
};

/**
 * Throws an error if the SVG element has an invalid attribute.
 * @param {object} svgElement - The SVG element to validate
 * @param {array[string]} validAttributes - An array of valid attributes to check against
 * @returns {void|Error}
 */
const checkForInvalidAttributesUsingValidAttributesArray = (
    svgElement,
    validAttributes
) => {
    for (const attributeKey of Object.keys(svgElement.attributes)) {
        if (!validAttributes.includes(attributeKey)) {
            throw new InvalidAttributeError(svgElement.name, attributeKey);
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

    checkForInvalidAttributesUsingInvalidAttributesArray(svgElement, [
        "stroke",
    ]);
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

    checkForRequiredAttributes(svgElement, ["viewBox"]);
    checkForInvalidAttributesUsingValidAttributesArray(svgElement, [
        "viewBox",
        "xmlns",
    ]);
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
 * @param {String=} absolutePathToSvgDirectory - The absolute path the the directory containing the SVG files.
 * @returns {Promise<void>}
 */
const formatSvgIcons = async (absolutePathToSvgDirectory) => {
    const absoluteFilePaths = await getSvgAbsoluteFilePaths(
        absolutePathToSvgDirectory
    );

    await Promise.all(
        absoluteFilePaths.map(async (filePath) => {
            try {
                const svgObject = await getSvgAsObject(filePath);
                formatSvg(svgObject);
                await writeFormattedSvgToFile(svgObject, filePath);
            } catch (error) {
                if (error instanceof InvalidAttributeError) {
                    throw new Error(
                        chalk`{red SVG element {bold "${error.elementName}"} has invalid attribute {bold "${error.attributeKey}"}. Error thrown in file {bold ${filePath}}. Please remove this attribute from the element.}`
                    );
                }

                if (error instanceof MissingRequiredAttributeError) {
                    throw new Error(
                        chalk`{red SVG element {bold "${error.elementName}"} is missing attribute {bold "${error.attributeKey}"}. Error thrown in file {bold ${filePath}}. Please add this attribute to the element.}`
                    );
                }

                if (error instanceof EmptySvgError) {
                    throw new Error(
                        chalk`{red SVG at {bold ${filePath}} does not have any children, which means that it is empty. Empty SVGs are not allowed.}`
                    );
                }

                throw error;
            }
        })
    );

    console.log(
        chalk`{green {bold ${absoluteFilePaths.length}} SVG file(s) were successfully formatted}`
    );
};

module.exports = formatSvgIcons;
