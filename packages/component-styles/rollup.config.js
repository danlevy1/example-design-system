import copy from "rollup-plugin-copy";
import del from "rollup-plugin-delete";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";
import pkg from "./package.json";

const external = [
    ...Object.keys(pkg.devDependencies),
    ...Object.keys(pkg.peerDependencies),
];

const plugins = [
    del({
        targets: "dist/*",
    }),
    copy({
        targets: [
            { src: "src/design-tokens/**/*", dest: "dist/design-tokens" },
        ],
    }),
    nodeResolve(),
    postcss(),
];

export default {
    input: "src/components/index.js",
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
