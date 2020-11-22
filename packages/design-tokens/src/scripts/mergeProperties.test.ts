const mock = require("mock-fs");
const { resolve } = require("path");
const { readFile } = require("fs").promises;
const { mergeProperties } = require("./mergeProperties");

describe("Merge Properties", () => {
    /*
     * console.log statements are mocked to be hidden from the output.
     * To call console.log in the test, instead call `originalConsoleLog(..).
     */
    const originalConsoleLog = console.log;

    beforeAll(() => {
        console.log = jest.fn();
    });

    afterAll(() => {
        console.log = originalConsoleLog;
    });

    afterEach(() => {
        mock.restore();
    });

    it("Throws an error if a non-JSON file exists in the directory (including nested directories)", async () => {
        mock({
            [`${resolve(__dirname, "../properties")}`]: {
                color: {
                    "raw.json": "{}",
                },
                font: {
                    "font-size": {
                        "raw.js": "{}",
                    },
                    "font-weight": {
                        "raw.json": "{}",
                    },
                    "line-height": {
                        "raw.json": "{}",
                    },
                },
            },
        });

        await expect(
            mergeProperties(resolve(__dirname, "../properties"))
        ).rejects.toThrowError();
    });

    it("Does not throw an error if the root directory is empty", async () => {
        mock({
            [`${resolve(__dirname, "../properties")}`]: {},
        });

        await expect(
            mergeProperties(resolve(__dirname, "../properties"))
        ).resolves.not.toThrowError();
    });

    it("Does not throw an error if the root directory is empty", async () => {
        mock({
            [`${resolve(__dirname, "../properties")}`]: {
                color: {
                    "raw.json": "{}",
                },
                font: {
                    "font-size": {
                        "raw.json": "{}",
                    },
                    "font-weight": {},
                    "line-height": {
                        "raw.json": "{}",
                    },
                },
            },
        });

        await expect(
            mergeProperties(resolve(__dirname, "../properties"))
        ).resolves.not.toThrowError();
    });

    it("Deep merges all JSON files", async () => {
        mock({
            [`${resolve(__dirname, "../properties")}`]: {
                color: {
                    "raw.json": `{"raw":{"color":{"purple":{"100":{"value":"#a9a5be"}},"blue":{"100":{"value":"#a9c6cf"}},"green":{"100":{"value":"#c6dad5"}},"black":{"100":{"value":"#888888"}},"white":{"100":{"value":"#f2f2f2"}}}}}`,
                },
                font: {
                    "font-size": {
                        "raw.json": `{"raw":{"font":{"size":{"100":{"value":"12px"}}}}}`,
                    },
                    "font-weight": {
                        "raw.json": `{"raw":{"font":{"weight":{"100":{"value":"lighter"}}}}}`,
                    },
                    "line-height": {
                        "raw.json": `{"raw":{"line":{"height":{"100":{"value":"14px"}}}}}`,
                    },
                },
            },
        });

        await mergeProperties(resolve(__dirname, "../properties"));

        const file = await readFile(
            resolve(__dirname, "../../dist/properties.json"),
            "utf8"
        );

        const validDeepMergeObject = {
            raw: {
                color: {
                    purple: { "100": { value: "#a9a5be" } },
                    blue: { "100": { value: "#a9c6cf" } },
                    green: { "100": { value: "#c6dad5" } },
                    black: { "100": { value: "#888888" } },
                    white: { "100": { value: "#f2f2f2" } },
                },
                font: {
                    size: { "100": { value: "12px" } },
                    weight: { "100": { value: "lighter" } },
                },
                line: { height: { "100": { value: "14px" } } },
            },
        };

        await expect(file).toBe(JSON.stringify(validDeepMergeObject));
    });
});
