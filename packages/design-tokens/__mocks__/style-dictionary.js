const styleDictionary = jest.genMockFromModule("style-dictionary");

styleDictionary.registerTransformGroup = function () {};

styleDictionary.extend = function () {
    return { buildAllPlatforms: function () {} };
};

module.exports = styleDictionary;
