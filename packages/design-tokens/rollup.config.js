import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";
import cleanup from "rollup-plugin-cleanup";
import pkg from "./package.json";

const input = "src/index.js";
const plugins = [
    del({
        targets: "dist/*",
    }),
    copy({
        targets: [{ src: "src/properties", dest: "dist" }],
    }),
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

export default {
    input,
    output: {
        file: pkg.main,
        format: "cjs",
    },
    plugins,
    external,
};
