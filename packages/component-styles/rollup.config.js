import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import pkg from "./package.json";

const isInWatchMode = process.env.ROLLUP_WATCH;

const scopedCssModuleName = isInWatchMode
    ? "[name]__[local]___[hash:base64:5]"
    : "___[hash:base64:5]";

const external = [
    ...Object.keys(pkg.devDependencies),
    ...Object.keys(pkg.peerDependencies),
];

const plugins = [
    del({
        targets: "dist/*",
    }),
    copy({
        targets: [{ src: "src/**/*.d.ts", dest: "dist/types" }],
        flatten: false,
    }),
    nodeResolve(),
    postcss({
        minimize: true,
        modules: {
            generateScopedName: scopedCssModuleName,
        },
    }),
];

export default {
    input: "src/index.js",
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
    onwarn: (warning) => {
        throw new Error(warning.message);
    },
};
