const { resolve } = require("path");

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

        config.module.rules.push({
            test: /\.scss$/,
            loaders: [
                "style-loader",
                {
                    loader: "css-loader",
                    options: {
                        modules: {
                            localIdentName: "[name]__[local]___[hash:base64:5]",
                        },
                    },
                },
                "sass-loader",
            ],
            include: resolve(__dirname, "../src"),
        });

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
