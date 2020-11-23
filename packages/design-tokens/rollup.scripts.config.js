import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import pkg from "./package.json";

export default {
    input: "src/scripts/mergePropertiesRunner.ts",
    output: {
        file: "src/scripts/build/mergePropertiesRunner.mjs",
        format: "es",
    },
    plugins: [
        json(),
        typescript({
            typescript: require("typescript"),
            tsconfig: "./tsconfig.json",
        }),
    ],
    external: [
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
        ...Object.keys(pkg.devDependencies || {}),
        "path",
        "fs/promises",
        "url",
    ],
};
