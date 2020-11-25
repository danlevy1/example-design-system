const { resolve } = require("path");
const { promisify } = require("util");
const rimraf = require("rimraf");
const { readFile } = require("fs/promises");
const { buildDesignTokens, PlatformOptions } = require("../buildDesignTokens");
const { assert } = require("console");
const rimrafPromise = promisify(rimraf);

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

        it("Logs a warning when the platform's destination path property does not have a trailing slash", async () => {
            const originalConsoleWarn = console.warn;
            console.warn = jest.fn();

            expect.assertions(1);

            const platform = {
                name: PlatformOptions.CSS,
                destinationPath: resolve(__dirname, "./tokens"),
                destinationFilename: "tokens.css",
            };

            await buildDesignTokens([platform]);

            expect(console.warn).toHaveBeenCalledTimes(1);

            console.warn = originalConsoleWarn;
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

    describe("Build Design Token File", () => {
        it("Outputs a file with the design tokens", async () => {
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

            const outputTokensString = outputFile
                .substring(
                    outputFile.indexOf("{") + 1,
                    outputFile.indexOf("}") - 1
                )
                .replace(/\s/g, "");

            expect(outputTokensString).not.toHaveLength(0);
        });
    });
});
