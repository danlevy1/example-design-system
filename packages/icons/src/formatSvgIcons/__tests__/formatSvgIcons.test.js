const { resolve } = require("path");
const { readFile } = require("fs/promises");
const { parse } = require("svgson");
const formatSvgIcons = require("../formatSvgIcons");

describe("Format SVG Icons", () => {
    it("Throws an error when the SVG has no children elements (i.e. is an empty SVG)", async () => {
        expect.assertions(1);

        try {
            await formatSvgIcons(resolve(__dirname, "./empty"));
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
    });

    it("Throws an error when the SVG has an invalid attribute on the `svg` element", async () => {
        expect.assertions(1);

        try {
            await formatSvgIcons(resolve(__dirname, "./invalidAttribute"));
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
    });

    it("Throws an error when the `viewBox` attribute is missing.", async () => {
        expect.assertions(1);

        try {
            await formatSvgIcons(resolve(__dirname, "./missingViewBox"));
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
    });

    it("Throws an error when the `stroke` attribute is used", async () => {
        expect.assertions(1);

        try {
            await formatSvgIcons(resolve(__dirname, "./withStrokeAttribute"));
        } catch (e) {
            expect(e).toBeInstanceOf(Error);
        }
    });

    it("Removes the `width` attribute if it exists", async () => {
        await formatSvgIcons(resolve(__dirname, "./withWidthAttribute"));

        const svgContent = await readFile(
            resolve(__dirname, "./withWidthAttribute/icon.svg"),
            { encoding: "utf-8" }
        );
        const svgObject = await parse(svgContent);

        expect(svgObject.attributes).not.toHaveProperty("width");
    });

    it("Removes the `height` attribute if it exists", async () => {
        await formatSvgIcons(resolve(__dirname, "./withHeightAttribute"));

        const svgContent = await readFile(
            resolve(__dirname, "./withHeightAttribute/icon.svg"),
            { encoding: "utf-8" }
        );
        const svgObject = await parse(svgContent);

        expect(svgObject.attributes).not.toHaveProperty("height");
    });

    it("Adds the `xmlns` attribute when it doesn't already exist", async () => {
        await formatSvgIcons(resolve(__dirname, "./missingXmlnsAttribute"));

        const svgContent = await readFile(
            resolve(__dirname, "./missingXmlnsAttribute/icon.svg"),
            { encoding: "utf-8" }
        );
        const svgObject = await parse(svgContent);

        expect(svgObject.attributes).toHaveProperty("xmlns");
    });

    it("Does not throw an error when the SVG is correctly formatted", async () => {
        const result = await formatSvgIcons(
            resolve(__dirname, "./preFormatted")
        );
        expect(result).toBe(undefined);
    });
});
