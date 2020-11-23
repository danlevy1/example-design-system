import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import pkg from "./package.json";

const input = "src/index.ts";
const plugins = [
    json(),
    commonjs(),
    typescript({
        typescript: require("typescript"),
        tsconfig: "./tsconfig.prod.json",
    }),
];
const external = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    "path",
    "url",
];

export default [
    {
        input,
        output: {
            file: pkg.module,
            format: "es",
        },
        plugins,
        external,
    },
    {
        input,
        output: {
            file: pkg.main,
            format: "cjs",
        },
        plugins,
        external,
    },
];
