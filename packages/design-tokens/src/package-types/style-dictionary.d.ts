declare module "style-dictionary" {
    interface StyleDictionaryConfig {
        source: string[];
        platforms: {
            [platformName: string]: any;
        };
    }

    const registerTransformGroup: (group: object) => void;

    const extend: (
        config: StyleDictionaryConfig
    ) => {
        buildAllPlatforms: () => void;
    };
}
