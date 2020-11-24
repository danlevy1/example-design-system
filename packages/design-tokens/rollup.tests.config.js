import globby from "globby";
import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import pkg from "./package.json";

const plugins = [
    replace({
        "import.meta.url": "__dirname",
    }),
    json(),
    commonjs(),
    typescript({
        typescript: require("typescript"),
        tsconfig: "./tsconfig.json",
    }),
];
const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    "path",
    "fs/promises",
    "url",
];

export default async () => {
    const paths = await globby(["src/**/*.test.ts"]);

    return paths.map((path) => ({
        input: path,
        output: {
            file: path
                .replace(/[a-zA-z0-9]*.test.ts/, (match) => `build/${match}`)
                .replace(".ts", ".js"),
            format: "cjs",
        },
        plugins: plugins,
        external: external,
    }));
};
