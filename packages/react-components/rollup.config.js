import commonjs from "@rollup/plugin-commonjs";
import del from "rollup-plugin-delete";
import cleanup from "rollup-plugin-cleanup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import styles from "rollup-plugin-styles";
import babel from "@rollup/plugin-babel";
import pkg from "./package.json";

const isInWatchMode = process.env.ROLLUP_WATCH;

const scopedCssModuleName = isInWatchMode
    ? "[name]__[local]___[hash:5]"
    : "___[hash:5]";

const external = [
    ...Object.keys(pkg.devDependencies),
    ...Object.keys(pkg.peerDependencies),
];

const extensions = [".js", ".jsx", ".ts", ".tsx"];

const plugins = [
    del({
        targets: "dist/*",
    }),
    nodeResolve({ extensions }),
    commonjs(),
    styles({
        minimize: true,
        modules: {
            generateScopedName: scopedCssModuleName,
        },
        mode: ["inject", { treeshakeable: true }],
    }),
    babel({
        babelHelpers: "runtime",
        extensions,
        skipPreflightCheck: true, // Remove this once https://github.com/rollup/plugins/issues/381 is fixed
    }),
    cleanup({ comments: "jsdoc", maxEmptyLines: 1, sourcemap: false }),
];

export default {
    input: "src/components/index.ts",
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
