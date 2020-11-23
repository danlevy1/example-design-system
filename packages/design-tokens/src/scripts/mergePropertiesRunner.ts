import { resolve } from "path";
import mergeProperties from "../mergeProperties/mergeProperties.js";
import getDirname from "../utils/dirname";

const DIRNAME = getDirname(import.meta.url);
const inputDir = resolve(DIRNAME, "../../properties");
const outputDir = resolve(DIRNAME, "../../../dist");

mergeProperties(inputDir, outputDir);
