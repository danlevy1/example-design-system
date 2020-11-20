const styleDictionary = jest.genMockFromModule("style-dictionary");

styleDictionary.registerTransformGroup = function () {};

styleDictionary.extend = function () {};

styleDictionary.buildAllPlatforms = function () {};

module.exports = styleDictionary;
