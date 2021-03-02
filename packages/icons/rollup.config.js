import commonjs from "@rollup/plugin-commonjs";
import svg from "rollup-plugin-svg";
import del from "rollup-plugin-delete";
import cleanup from "rollup-plugin-cleanup";
import externals from "rollup-plugin-node-externals";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import pkg from "./package.json";

const input = "src/index.js";
const plugins = [
    del({
        targets: "dist/*",
    }),
    nodeResolve(),
    externals({
        packagePath: "./package.json",
    }),
    commonjs(),
    svg(),
    cleanup({ comments: "jsdoc", maxEmptyLines: 1, sourcemap: false }),
];

export default {
    input,
    output: [
        {
            file: pkg.main,
            format: "cjs",
            exports: "named",
        },
        {
            file: pkg.module,
            format: "esm",
            exports: "named",
        },
    ],
    plugins,
    onwarn: (warning) => {
        throw new Error(warning.message);
    },
};
