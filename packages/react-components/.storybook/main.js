module.exports = {
    webpackFinal: async (config) => {
        /*
         * Ignores all node modules except for those in the "@x3r5e" org.
         * See https://stackoverflow.com/a/59954986/6063755
         */
        config.watchOptions = {
            ignored: [
                /node_modules\/(?!@x3r5e\/.+)/,
                /\@x3r5e\/.+\/node_modules/,
            ],
        };

        return config;
    },
    stories: [
        "../src/components/**/*.stories.mdx",
        "../src/components/**/*.stories.@(js|jsx|ts|tsx)",
    ],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "storybook-css-modules-preset",
    ],
};
