const postcssPresetEnv = require("postcss-preset-env");
const cssnano = require("cssnano");
const reporter = require("postcss-reporter");

module.exports = {
    plugins: [
        postcssPresetEnv,
        cssnano,
        reporter({ clearReportedMessages: true }),
    ],
};
