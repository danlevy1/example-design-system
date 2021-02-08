import commonjs from "@rollup/plugin-commonjs";
import del from "rollup-plugin-delete";
import cleanup from "rollup-plugin-cleanup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import pkg from "./package.json";

const external = [
    ...Object.keys(pkg.dependencies),
    ...Object.keys(pkg.peerDependencies),
];

const extensions = [".js", ".jsx", ".ts", ".tsx"];

const plugins = [
    del({
        targets: "dist/*",
    }),
    json(),
    nodeResolve({ extensions }),
    commonjs(),
    babel({ exclude: "node_modules/**", babelHelpers: "runtime", extensions }),
    cleanup({ comments: "jsdoc", maxEmptyLines: 1, sourcemap: false }),
];

export default {
    input: "src/index.ts",
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
    external,
};
