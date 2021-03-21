const { resolve } = require("path");
const { promisify } = require("util");
const rimraf = require("rimraf");
const { readFile } = require("fs/promises");
const { buildDesignTokens, PlatformOptions } = require("../buildDesignTokens");
const rimrafPromise = promisify(rimraf);

const tokensKebabCase = new Map([
    ["color-purple-100", "#A9A5BE"],
    ["shadow-focus", "0 0 0 0.0625rem #000000, 0 0 0 0.1875rem #000000"],
    ["size-font-100", "0.75rem"],
    ["weight-font-200", 200],
]);

const tokensPascalCase = new Map([
    ["COLOR_PURPLE_100", "#A9A5BE"],
    ["SHADOW_FOCUS", "0 0 0 0.0625rem #000000, 0 0 0 0.1875rem #000000"],
    ["SIZE_FONT_100", "0.75rem"],
    ["WEIGHT_FONT_200", 200],
]);

const tokensJS = {
    color: {
        purple: {
            100: "#A9A5BE",
        },
    },
    shadow: {
        focus: "0 0 0 0.0625rem #000000, 0 0 0 0.1875rem #000000",
    },
    size: {
        font: {
            100: "0.75rem",
        },
    },
    weight: {
        font: {
            200: 200,
        },
    },
};

describe("Build Design Tokens", () => {
    /*
     * console.log statements are mocked to be hidden from the output.
     * 🚨🚨 To call console.log in a test, instead call `originalConsoleLog(..) 🚨🚨
     */
    const originalConsoleLog = console.log;

    beforeAll(() => {
        console.log = jest.fn();
    });

    afterAll(() => {
        console.log = originalConsoleLog;
    });

    afterEach(async () => {
        await rimrafPromise(resolve(__dirname, "./output-tokens"));
    });

    describe("Platform Validation", () => {
        it("Throws an error when no platforms are provided", async () => {
            expect.assertions(1);

            try {
                await buildDesignTokens();
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("Throws an error when the first argument of `buildDesignTokens` not of type array", async () => {
            expect.assertions(1);

            const platform = {
                destinationPath: `${resolve(__dirname, "./output-tokens")}/`,
                destinationFilename: "tokens.css",
            };

            try {
                await buildDesignTokens(platform);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("Throws an error when the second argument of `buildDesignTokens` not of type array", async () => {
            expect.assertions(1);

            const platform = {
                destinationPath: `${resolve(__dirname, "./output-tokens")}/`,
                destinationFilename: "tokens.css",
            };

            try {
                await buildDesignTokens([platform], "src/**/*.json");
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("Throws an error when the platform does not have a name property", async () => {
            expect.assertions(1);

            const platform = {
                destinationPath: `${resolve(__dirname, "./output-tokens")}/`,
                destinationFilename: "tokens.css",
            };

            try {
                await buildDesignTokens([platform]);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("Throws an error when the platform has an invalid name property", async () => {
            expect.assertions(1);

            const platform = {
                name: "ts",
                destinationPath: `${resolve(__dirname, "./output-tokens")}/`,
                destinationFilename: "tokens.css",
            };

            try {
                await buildDesignTokens([platform]);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("Throws an error when the platform does not have a destination path property", async () => {
            expect.assertions(1);

            const platform = {
                name: PlatformOptions.CSS,
                destinationFilename: "tokens.css",
            };

            try {
                await buildDesignTokens([platform]);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("Throws an error when the platform does not have a destination filename property", async () => {
            expect.assertions(1);

            const platform = {
                name: PlatformOptions.CSS,
                destinationPath: `${resolve(__dirname, "./output-tokens")}/`,
            };

            try {
                await buildDesignTokens([platform]);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("Throws an error when the platform's 'destination filename property has a slash", async () => {
            expect.assertions(1);

            const platform = {
                name: PlatformOptions.CSS,
                destinationPath: `${resolve(__dirname, "./output-tokens")}/`,
                destinationFilename: "/tokens.css",
            };

            try {
                await buildDesignTokens([platform]);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("Does not throw an error when the platform is valid", async () => {
            const platform = {
                name: PlatformOptions.CSS,
                destinationPath: `${resolve(__dirname, "./output-tokens")}/`,
                destinationFilename: "tokens.css",
            };

            const result = await buildDesignTokens([platform]);
            expect(result).toBeUndefined();
        });
    });

    describe("Build Design Token Files", () => {
        it("Outputs a CSS file with the design tokens", async () => {
            const platform = {
                name: PlatformOptions.CSS,
                destinationPath: `${resolve(__dirname, "./output-tokens")}/`,
                destinationFilename: "tokens.css",
            };

            await buildDesignTokens(
                [platform],
                [resolve(__dirname, "./tokens/**/*.yaml")]
            );

            const outputFile = await readFile(
                resolve(__dirname, "./output-tokens/tokens.css"),
                "utf8"
            );

            // Asserts that the file begins with ":root {\n"
            expect(outputFile).toMatch(/^:root {\n/);

            // Asserts that the file ends with "}\n"
            expect(outputFile).toMatch(/}\n$/);

            const outputTokens = outputFile
                .substring(
                    outputFile.indexOf("{") + 1,
                    outputFile.indexOf("}") - 1
                )
                .split("\n")
                .filter((outputToken) => !!outputToken)
                .map((outputToken) => outputToken.trim());

            // Asserts that the length and content of the output tokens file is correct
            expect(outputTokens.length).toBe(tokensKebabCase.size);
            tokensKebabCase.forEach((value, key) => {
                const cssVariableDeclaration = `--${key}: ${value};`;
                expect(outputTokens).toContain(cssVariableDeclaration);
            });
        });

        it("Outputs an SCSS file with the design tokens", async () => {
            const platform = {
                name: PlatformOptions.SCSS,
                destinationPath: `${resolve(__dirname, "./output-tokens")}/`,
                destinationFilename: "tokens.scss",
            };

            await buildDesignTokens(
                [platform],
                [resolve(__dirname, "./tokens/**/*.yaml")]
            );

            const outputFile = await readFile(
                resolve(__dirname, "./output-tokens/tokens.scss"),
                "utf8"
            );

            const outputTokens = outputFile
                .substring(
                    outputFile.indexOf("$"),
                    outputFile.lastIndexOf(";") + 1
                )
                .split("\n");

            // Asserts that the length and content of the output tokens file is correct
            expect(outputTokens.length).toBe(tokensKebabCase.size);
            tokensKebabCase.forEach((value, key) => {
                const scssVariableDeclaration = `$${key}: ${value};`;
                expect(outputTokens).toContain(scssVariableDeclaration);
            });
        });

        it("Outputs a LESS file with the design tokens", async () => {
            const platform = {
                name: PlatformOptions.LESS,
                destinationPath: `${resolve(__dirname, "./output-tokens")}/`,
                destinationFilename: "tokens.less",
            };

            await buildDesignTokens(
                [platform],
                [resolve(__dirname, "./tokens/**/*.yaml")]
            );

            const outputFile = await readFile(
                resolve(__dirname, "./output-tokens/tokens.less"),
                "utf8"
            );

            const outputTokens = outputFile
                .substring(
                    outputFile.indexOf("@"),
                    outputFile.lastIndexOf(";") + 1
                )
                .split("\n");

            // Asserts that the length and content of the output tokens file is correct
            expect(outputTokens.length).toBe(tokensKebabCase.size);
            tokensKebabCase.forEach((value, key) => {
                const scssVariableDeclaration = `@${key}: ${value};`;
                expect(outputTokens).toContain(scssVariableDeclaration);
            });
        });

        it("Outputs a CJS file with the design tokens", async () => {
            const platform = {
                name: PlatformOptions.CJS,
                destinationPath: `${resolve(__dirname, "./output-tokens")}/`,
                destinationFilename: "tokens.cjs",
            };

            await buildDesignTokens(
                [platform],
                [resolve(__dirname, "./tokens/**/*.yaml")]
            );

            const outputFile = await readFile(
                resolve(__dirname, "./output-tokens/tokens.cjs"),
                "utf8"
            );

            // Asserts that the file begins with "module.exports = {\n"
            expect(outputFile).toMatch(/^module.exports = {\n/);

            // Asserts that the file ends with "};"
            expect(outputFile).toMatch(/};$/);

            const outputTokens = outputFile
                .substring(
                    outputFile.indexOf("{") + 1,
                    outputFile.indexOf("}") - 1
                )
                .split("\n")
                .filter((outputToken) => !!outputToken)
                .map((outputToken) => outputToken.trim());

            // Asserts that the length and content of the output tokens file is correct
            expect(outputTokens.length).toBe(tokensPascalCase.size);

            tokensPascalCase.forEach((value, key) => {
                let jsProperty = `"${key}": `;
                if (isNaN(value)) {
                    jsProperty += `"${value}"`;
                } else {
                    jsProperty += value;
                }

                const indexOfDeclaration = outputTokens.indexOf(jsProperty);

                // All JS properties should have a comma except for the last property
                if (indexOfDeclaration !== outputTokens.length - 1) {
                    jsProperty += ",";
                }

                expect(outputTokens).toContain(jsProperty);
            });
        });

        it("Outputs an ESM file with the design tokens", async () => {
            const platform = {
                name: PlatformOptions.ESM,
                destinationPath: `${resolve(__dirname, "./output-tokens")}/`,
                destinationFilename: "tokens.mjs",
            };

            await buildDesignTokens(
                [platform],
                [resolve(__dirname, "./tokens/**/*.yaml")]
            );

            const outputFile = await readFile(
                resolve(__dirname, "./output-tokens/tokens.mjs"),
                "utf8"
            );

            // Asserts that the file ends with ";"
            expect(outputFile).toMatch(/;$/);

            const outputTokens = outputFile
                .substring(
                    outputFile.indexOf("export"),
                    outputFile.lastIndexOf(";") + 1
                )
                .split("\n");

            // Asserts that the length and content of the output tokens file is correct
            expect(outputTokens.length).toBe(tokensPascalCase.size);
            tokensPascalCase.forEach((value, key) => {
                let cssVariableDeclaration = `export const ${key} = `;
                if (isNaN(value)) {
                    cssVariableDeclaration += `"${value}"`;
                } else {
                    cssVariableDeclaration += value;
                }
                cssVariableDeclaration += ";";

                expect(outputTokens).toContain(cssVariableDeclaration);
            });
        });

        it("Outputs a JSON file with the design tokens", async () => {
            const platform = {
                name: PlatformOptions.JSON,
                destinationPath: `${resolve(__dirname, "./output-tokens")}/`,
                destinationFilename: "tokens.json",
            };

            await buildDesignTokens(
                [platform],
                [resolve(__dirname, "./tokens/**/*.yaml")]
            );

            const outputFile = await readFile(
                resolve(__dirname, "./output-tokens/tokens.json"),
                "utf8"
            );

            expect(JSON.parse(outputFile)).toEqual(tokensJS);
        });
    });
});
