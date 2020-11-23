import {
    buildDesignTokens,
    Platform,
    PlatformOptions,
    PLATFORM_FORMATS_MAP,
    styleDictionaryConfig,
} from "./buildDesignTokens";

describe("Build Design Tokens", () => {
    describe("Platform Validation", () => {
        it("Throws an error when the platform does not have a name property", async () => {
            const platform: Partial<Platform> = {
                destinationPath: "./src/",
                destinationFilename: "test.css",
            };

            try {
                await buildDesignTokens([platform as Platform]);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("Throws an error when the platform has an invalid name property", async () => {
            const platform: Platform = {
                // @ts-ignore
                name: "ts",
                destinationPath: "./src/",
                destinationFilename: "test.css",
            };

            try {
                await buildDesignTokens([platform]);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("Throws an error when the platform does not have a destination path property", async () => {
            const platform: Partial<Platform> = {
                name: PlatformOptions.CSS,
                destinationFilename: "test.css",
            };

            try {
                await buildDesignTokens([platform as Platform]);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("Throws an error when the platform's destination path property does not have a trailing slash", async () => {
            const platform: Platform = {
                name: PlatformOptions.CSS,
                destinationPath: "./src",
                destinationFilename: "test.css",
            };

            try {
                await buildDesignTokens([platform]);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("Throws an error when the platform does not have a destination filename property", async () => {
            const platform: Partial<Platform> = {
                name: PlatformOptions.CSS,
                destinationPath: "./src/",
            };

            try {
                await buildDesignTokens([platform as Platform]);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("Throws an error when the platform's 'destination filename property has a slash", async () => {
            const platform: Platform = {
                name: PlatformOptions.CSS,
                destinationPath: "./src/",
                destinationFilename: "src/test.css",
            };

            try {
                await buildDesignTokens([platform]);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });

        it("Does not throw an error when the platform is valid", async () => {
            const platform: Platform = {
                name: PlatformOptions.CSS,
                destinationPath: "./src/",
                destinationFilename: "test.css",
            };

            const result = await buildDesignTokens([platform]);
            expect(result).toBeUndefined();
        });
    });

    describe("Add Platform to Config", () => {
        beforeEach(() => {
            jest.resetModules();
        });

        it("Adds the platform to the config", async () => {
            const PLATFORM_NAME = PlatformOptions.CSS;
            const PLATFORM_FILE_FORMAT = PLATFORM_FORMATS_MAP.get(
                PLATFORM_NAME
            );

            const platform: Platform = {
                name: PLATFORM_NAME,
                destinationPath: "./src/",
                destinationFilename: "test.css",
            };

            await buildDesignTokens([platform]);

            expect(styleDictionaryConfig).toHaveProperty("platforms");
            expect(styleDictionaryConfig.platforms).toHaveProperty(
                PLATFORM_NAME
            );

            const configPlatform =
                styleDictionaryConfig.platforms[PLATFORM_NAME];

            expect(configPlatform).toHaveProperty("transformGroup");
            expect(configPlatform).toHaveProperty("buildPath");
            expect(configPlatform).toHaveProperty("files");
            expect(configPlatform.files).toHaveLength(1);

            const configPlatformFile = configPlatform.files[0];

            expect(configPlatformFile).toHaveProperty("destination");
            expect(configPlatformFile).toHaveProperty("format");
            expect(configPlatformFile.format).toBe(PLATFORM_FILE_FORMAT);
        });
    });
});
