const { resolve } = require("path");
const { promisify } = require("util");
const rimraf = require("rimraf");
const { readFile } = require("fs/promises");
const { buildDesignTokens, PlatformOptions } = require("../buildDesignTokens");
const rimrafPromise = promisify(rimraf);

const tokensKebabCase = new Map([
    ["raw-color-purple-100", "#a9a5be"],
    ["raw-font-size-100", "12px"],
    ["raw-font-weight-100", "lighter"],
]);

const tokensPascalCase = new Map([
    ["RAW_COLOR_PURPLE_100", "#a9a5be"],
    ["RAW_FONT_SIZE_100", "12px"],
    ["RAW_FONT_WEIGHT_100", "lighter"],
]);

const tokensJS = {
    raw: {
        color: {
            purple: {
                100: "#a9a5be",
            },
        },
        font: {
            size: {
                100: "12px",
            },
            weight: {
                100: "lighter",
            },
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
        await rimrafPromise(resolve(__dirname, "./tokens"));
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
                destinationPath: `${resolve(__dirname, "./tokens")}/`,
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
                destinationPath: `${resolve(__dirname, "./tokens")}/`,
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
                destinationPath: `${resolve(__dirname, "./tokens")}/`,
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
                destinationPath: `${resolve(__dirname, "./tokens")}/`,
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
                destinationPath: `${resolve(__dirname, "./tokens")}/`,
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
                destinationPath: `${resolve(__dirname, "./tokens")}/`,
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
                destinationPath: `${resolve(__dirname, "./tokens")}/`,
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
                destinationPath: `${resolve(__dirname, "./tokens")}/`,
                destinationFilename: "tokens.css",
            };

            await buildDesignTokens(
                [platform],
                [resolve(__dirname, "./properties/**/*.json")]
            );

            const outputFile = await readFile(
                resolve(__dirname, "./tokens/tokens.css"),
                "utf8"
            );

            // Asserts that the file begins with a /** */ comment and ":root {\n"
            expect(outputFile).toMatch(/^\/\*\*(.|\n)*\*\/\n\n:root {\n/);

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
                destinationPath: `${resolve(__dirname, "./tokens")}/`,
                destinationFilename: "tokens.scss",
            };

            await buildDesignTokens(
                [platform],
                [resolve(__dirname, "./properties/**/*.json")]
            );

            const outputFile = await readFile(
                resolve(__dirname, "./tokens/tokens.scss"),
                "utf8"
            );

            // Asserts that the file begins with // comments followed by two newlines
            expect(outputFile).toMatch(/^\n*\/\/(.|\n)*\/\/(.)*\n\n/);

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
                destinationPath: `${resolve(__dirname, "./tokens")}/`,
                destinationFilename: "tokens.less",
            };

            await buildDesignTokens(
                [platform],
                [resolve(__dirname, "./properties/**/*.json")]
            );

            const outputFile = await readFile(
                resolve(__dirname, "./tokens/tokens.less"),
                "utf8"
            );

            // Asserts that the file begins with // comments followed by two newlines
            expect(outputFile).toMatch(/^\n*\/\/(.|\n)*\/\/(.)*\n\n/);

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
                destinationPath: `${resolve(__dirname, "./tokens")}/`,
                destinationFilename: "tokens.cjs",
            };

            await buildDesignTokens(
                [platform],
                [resolve(__dirname, "./properties/**/*.json")]
            );

            const outputFile = await readFile(
                resolve(__dirname, "./tokens/tokens.cjs"),
                "utf8"
            );

            // Asserts that the file begins with a /** */ comment and "module.exports = {\n"
            expect(outputFile).toMatch(
                /^\/\*\*(.|\n)*\*\/\n\nmodule.exports = {\n/
            );

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
                let jsProperty = `"${key}": "${value}"`;
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
                destinationPath: `${resolve(__dirname, "./tokens")}/`,
                destinationFilename: "tokens.mjs",
            };

            await buildDesignTokens(
                [platform],
                [resolve(__dirname, "./properties/**/*.json")]
            );

            const outputFile = await readFile(
                resolve(__dirname, "./tokens/tokens.mjs"),
                "utf8"
            );

            // Asserts that the file begins with a /** */ comment and two newlines
            expect(outputFile).toMatch(/^\/\*\*(.|\n)*\*\/\n\n/);

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
                const cssVariableDeclaration = `export const ${key} = "${value}";`;
                expect(outputTokens).toContain(cssVariableDeclaration);
            });
        });

        it("Outputs a JSON file with the design tokens", async () => {
            const platform = {
                name: PlatformOptions.JSON,
                destinationPath: `${resolve(__dirname, "./tokens")}/`,
                destinationFilename: "tokens.json",
            };

            await buildDesignTokens(
                [platform],
                [resolve(__dirname, "./properties/**/*.json")]
            );

            const outputFile = await readFile(
                resolve(__dirname, "./tokens/tokens.json"),
                "utf8"
            );

            expect(JSON.parse(outputFile)).toEqual(tokensJS);
        });
    });
});
