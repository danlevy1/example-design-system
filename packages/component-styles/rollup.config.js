import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import styles from "rollup-plugin-styles";
import pkg from "./package.json";

const isInWatchMode = process.env.ROLLUP_WATCH;

const scopedCssModuleName = isInWatchMode
    ? "[name]__[local]___[hash:5]"
    : "___[hash:5]";

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
    styles({
        minimize: true,
        modules: {
            generateScopedName: scopedCssModuleName,
        },
    }),
];

const outputFileSharedOptions = {
    exports: "named",
};

export default {
    input: "src/index.js",
    output: [
        {
            file: pkg.main,
            format: "cjs",
            ...outputFileSharedOptions,
        },
        {
            file: pkg.module,
            format: "esm",
            ...outputFileSharedOptions,
        },
    ],
    plugins,
    external,
    onwarn: (warning) => {
        throw new Error(warning.message);
    },
};
