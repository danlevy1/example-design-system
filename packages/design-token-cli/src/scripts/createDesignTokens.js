const propertiesFilePath = require.resolve("@x3r5e/design-tokens");

const StyleDictionary = require("style-dictionary").extend({
    source: [propertiesFilePath],
    platforms: {
        scss: {
            transformGroup: "scss",
            buildPath: "../../dist/",
            files: [
                {
                    destination: "variables.scss",
                    format: "scss/variables",
                },
            ],
        },
    },
});

StyleDictionary.buildAllPlatforms();
