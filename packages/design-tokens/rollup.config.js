import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import replace from "@rollup/plugin-replace";
import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";
import cleanup from "rollup-plugin-cleanup";
import pkg from "./package.json";

console.log(pkg.types);

const input = "src/index.js";
const plugins = [
    json(),
    commonjs(),
    cleanup({ comments: "jsdoc", maxEmptyLines: 1, sourcemap: false }),
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
        plugins: [
            // `del` and `copy` are the first plugins to run for the first file. It doesn't matter which file comes first though.
            del({
                targets: "dist/*",
            }),
            copy({
                targets: [{ src: "src/properties", dest: "dist" }],
            }),
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
