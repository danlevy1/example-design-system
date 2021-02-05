import commonjs from "@rollup/plugin-commonjs";
import del from "rollup-plugin-delete";
import cleanup from "rollup-plugin-cleanup";
import externals from "rollup-plugin-node-externals";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import pkg from "./package.json";

const plugins = [
    del({
        targets: "dist/*",
    }),
    json(),
    externals({
        packagePath: "./package.json",
        include: ["@babel/runtime-corejs3"],
    }),
    nodeResolve(),
    commonjs(),
    typescript({ useTsconfigDeclarationDir: true }),
    babel({ exclude: "node_modules/**", babelHelpers: "runtime" }),
    cleanup({ comments: "jsdoc", maxEmptyLines: 1, sourcemap: false }),
];

export default {
    input: "src/index.ts",
    output: [
        {
            file: pkg.main,
            format: "cjs",
            sourcemap: true,
            exports: "named",
        },
        {
            file: pkg.module,
            format: "esm",
            sourcemap: true,
            exports: "named",
        },
    ],
    plugins,
};
