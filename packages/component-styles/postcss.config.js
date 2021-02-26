const postcssPresetEnv = require("postcss-preset-env");
const reporter = require("postcss-reporter");

module.exports = {
    plugins: [postcssPresetEnv, reporter({ clearReportedMessages: true })],
};
