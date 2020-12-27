/*
1. Add https://www.npmjs.com/package/svgson as a dev dependency
2. Remove "width" and "height" attributes from <svg> element. Any component library (e.g. `react-components`) that ingests the icons should dynamically add the width and height attributes based on offered sizes.
3. Remove the "fill" attribute from all elements (including nested elements). If any of the elements use `stroke` attribute, throw an error because all elements need to use the `fill` attribute.
*/

const { resolve } = require("path");
const { readFile, writeFile, readdir } = require("fs/promises");
const { parse, stringify } = require("svgson");
const chalk = require("chalk");

class SvgIconFormatter {
    constructor(absolutePathToSvgDirectory) {
        if (absolutePathToSvgDirectory) {
            this.absolutePathToSvgDirectory = absolutePathToSvgDirectory;
        } else {
            this.absolutePathToSvgDirectory = resolve(
                __dirname,
                "../../assets"
            );
        }
    }
    /**
     * Gets the absolute file path for each SVG file
     * @returns {Promise<Array[string]|Error>} An array of absolute file paths, or an error
     */
    getSvgAbsoluteFilePaths = async () => {
        const svgFileNames = await readdir(this.absolutePathToSvgDirectory);
        const absoluteFilePaths = svgFileNames.map(
            (fileName) => `${this.absolutePathToSvgDirectory}/${fileName}`
        );

        return absoluteFilePaths;
    };

    /**
     * Converts an SVG file into an AST as a JS object
     * @param {string} absoluteFilePath - The absolute path to the SVG file
     * @returns {Promise<string | Error>} The SVG as an objct, or an error
     */
    getSvgAsObject = async (absoluteFilePath) => {
        const svgContent = await readFile(absoluteFilePath, {
            encoding: "utf-8",
        });

        if (/^\s*$/.test(svgContent)) {
            throw new Error(`The SVG file is empty for ${absoluteFilePath}.`);
        }

        const svgObject = await parse(svgContent);

        return svgObject;
    };

    /**
     * Throws an error if the SVG element is missing a required attribute.
     * @param {object} svgElement - The SVG element to validate
     * @param {array[string]} requiredAttributes - An array of required attributes to check against
     * @returns {void|Error}
     */
    checkForRequiredAttributes = (svgElement, requiredAttributes) => {
        for (const requiredAttribute of requiredAttributes) {
            if (
                !Object.keys(svgElement.attributes).includes(requiredAttribute)
            ) {
                throw new Error(
                    chalk`{red SVG element {bold "${svgElement.name}"} is missing attribute {bold "${requiredAttribute}"}. Error thrown in file {bold ${this.absolutePathToSvgDirectory}}. Please add this attribute to the element.}`
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
    checkForInvalidAttributesUsingInvalidAttributesArray = (
        svgElement,
        invalidAttributes
    ) => {
        for (const attributeKey of Object.keys(svgElement.attributes)) {
            if (invalidAttributes.includes(attributeKey)) {
                throw new Error(
                    chalk`{red SVG element {bold "${svgElement.name}"} has invalid attribute {bold "${attributeKey}"}. Error thrown in file {bold ${this.absolutePathToSvgDirectory}}. Please remove this attribute from the element.}`
                );
            }
        }
    };

    /**
     * Throws an error if the SVG element has an invalid attribute.
     * @param {object} svgElement - The SVG element to validate
     * @param {array[string]} validAttributes - An array of valid attributes to check against
     * @returns {void|Error}
     */
    checkForInvalidAttributesUsingValidAttributesArray = (
        svgElement,
        validAttributes
    ) => {
        for (const attributeKey of Object.keys(svgElement.attributes)) {
            if (!validAttributes.includes(attributeKey)) {
                throw new Error(
                    chalk`{red SVG element {bold "${svgElement.name}"} has invalid attribute {bold "${attributeKey}"}. Error thrown in file {bold ${this.absolutePathToSvgDirectory}}. Please remove this attribute from the element.}`
                );
            }
        }
    };

    /**
     * Formats a child element of the root <svg> element
     * @param {object} svgElement - The SVG element to format
     * @returns {void|Error}
     */
    formatSvgChildElement = (svgElement) => {
        delete svgElement.attributes.fill;

        this.checkForInvalidAttributesUsingInvalidAttributesArray(svgElement, [
            "stroke",
        ]);
    };

    /**
     * Runs a DFS to format all children of an SVG
     * @param {object} svgElement - The SVG element to format
     * @returns {void|Error}
     */
    formatSvgChildElements = (svgElement) => {
        if (svgElement.children?.length > 0) {
            for (const childSvgElement of svgElement.children) {
                this.formatSvgChildElement(childSvgElement);
                this.formatSvgChildElements(childSvgElement);
            }
        }
    };

    /**
     * Formats the root SVG element (i.e. the <svg> element)
     * @param {object} svgElement - The root SVG element
     * @returns {void|Error}
     */
    formatSvgRootElement = (svgElement) => {
        if (!svgElement.attributes.xmlns) {
            svgElement.attributes.xmlns = "http://www.w3.org/2000/svg";
        }

        delete svgElement.attributes.width;
        delete svgElement.attributes.height;
        delete svgElement.attributes.style;
        delete svgElement.attributes.fill;

        if (svgElement.children?.length === 0) {
            throw new Error(
                chalk`{red SVG at {bold ${this.absolutePathToSvgDirectory}} does not have any children, which means that it is empty. Empty SVGs are not allowed.}`
            );
        }

        this.checkForRequiredAttributes(svgElement, ["viewBox"]);
        this.checkForInvalidAttributesUsingValidAttributesArray(svgElement, [
            "viewBox",
            "xmlns",
        ]);
    };

    /**
     * Formats the SVG
     * @param {object} svgElement - The root SVG element
     * @returns {void|Error}
     */
    formatSvg = (svgElement) => {
        this.formatSvgRootElement(svgElement);
        this.formatSvgChildElements(svgElement);
    };

    /**
     * Writes the formatted SVG to its original file
     * @param {object} svgObject - The formatted SVG object
     * @param {string} absoluteFilePath - The absolute path to the SVG file
     * @returns {Promise<void|Error>}
     */
    writeFormattedSvgToFile = async (svgObject, absoluteFilePath) => {
        const svgContent = stringify(svgObject);
        await writeFile(absoluteFilePath, svgContent);
    };
}

/**
 * Formats all SVGs
 * @param {String=} this.absolutePathToSvgDirectory - The absolute path the the directory containing the SVG files.
 * @returns {Promise<void>}
 */
const formatSvgIcons = async (absolutePathToSvgDirectory) => {
    const svgIconFormatter = new SvgIconFormatter(absolutePathToSvgDirectory);

    const absoluteFilePaths = await svgIconFormatter.getSvgAbsoluteFilePaths(
        this.absolutePathToSvgDirectory
    );

    await Promise.all(
        absoluteFilePaths.map(async (filePath) => {
            const svgObject = await svgIconFormatter.getSvgAsObject(filePath);
            svgIconFormatter.formatSvg(svgObject);
            await svgIconFormatter.writeFormattedSvgToFile(svgObject, filePath);
        })
    );
};

module.exports = formatSvgIcons;
