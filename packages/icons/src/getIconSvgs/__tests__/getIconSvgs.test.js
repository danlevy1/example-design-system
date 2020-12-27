const { resolve } = require("path");
const { getIconSvgs } = require("../getIconSvgs");

describe("Get Icon SVGs", () => {
    it("Does not retrieve icons that don't have a `.svg` file extension", async () => {
        const iconSvgs = await getIconSvgs(resolve(__dirname, "./assets"));

        expect(iconSvgs.size).toBe(3);

        for (const iconSvg of iconSvgs.values()) {
            expect(iconSvg).toMatch(/^<svg.*<\/svg>\s*$/);
        }
    });

    it("Does not include the file extension with the icon name", async () => {
        const correctIconNames = ["CheckIcon", "MinusIcon", "PlusIcon"];

        const iconSvgs = await getIconSvgs(resolve(__dirname, "./assets"));

        for (const iconName of iconSvgs.keys()) {
            expect(correctIconNames).toContain(iconName);
        }
    });

    it("Matches the icon name with the correct SVG", async () => {
        const correctIconsMap = new Map([
            [
                "CheckIcon",
                '<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M14.3965 4.39645C14.7298 4.06312 15.2702 4.06312 15.6036 4.39645C15.9369 4.72979 15.9369 5.27023 15.6036 5.60356L7.56067 13.6465C6.97488 14.2322 6.02513 14.2322 5.43935 13.6465L2.39645 10.6036C2.06312 10.2702 2.06312 9.72979 2.39645 9.39645C2.72979 9.06312 3.27023 9.06312 3.60356 9.39645L6.50001 12.2929L14.3965 4.39645Z"/></svg>',
            ],
            [
                "MinusIcon",
                '<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M3 10C2.44772 10 2 9.55228 2 9C2 8.44772 2.44772 8 3 8H15C15.5523 8 16 8.44772 16 9C16 9.55228 15.5523 10 15 10H3Z"/></svg>',
            ],
            [
                "PlusIcon",
                '<svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M8 3C8 2.44772 8.44772 2 9 2C9.55228 2 10 2.44772 10 3V15C10 15.5523 9.55228 16 9 16C8.44772 16 8 15.5523 8 15V3Z"/><path d="M3 10C2.44772 10 2 9.55228 2 9C2 8.44772 2.44772 8 3 8H15C15.5523 8 16 8.44772 16 9C16 9.55228 15.5523 10 15 10H3Z"/></svg>',
            ],
        ]);

        const iconSvgs = await getIconSvgs(resolve(__dirname, "./assets"));

        for (const [retrievedIconName, retrievedIconSvg] of iconSvgs) {
            expect(retrievedIconSvg).toBe(
                correctIconsMap.get(retrievedIconName)
            );
        }
    });
});
