import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import pkg from "./package.json";

console.log(pkg.types);

const input = "src/index.js";
const plugins = [json(), commonjs()];
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
        plugins: [
            replace({
                __dirname: "dirname(fileURLToPath(import.meta.url))",
            }),
            ...plugins,
        ],
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
