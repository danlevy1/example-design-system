import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
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
    copy({
        targets: [{ src: "assets", dest: "dist" }],
    }),
    nodeResolve(),
    externals({
        packagePath: "./package.json",
    }),
    commonjs(),
    cleanup({ comments: "jsdoc", maxEmptyLines: 1, sourcemap: false }),
];

export default {
    input,
    output: {
        file: pkg.main,
        format: "cjs",
    },
    plugins,
};
