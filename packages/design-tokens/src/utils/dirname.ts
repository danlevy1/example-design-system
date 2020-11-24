import { dirname } from "path";
import { fileURLToPath } from "url";

/**
 * Gets the ESM equivalent of `__dirname`
 * @param fileURL - The URL to get the path from
 */
const getDirname = (fileURL: string) => {
    if (typeof __dirname !== "undefined" && fileURL === __dirname) {
        return fileURL;
    }

    const DIRNAME = dirname(fileURLToPath(fileURL));
    return DIRNAME;
};

export default getDirname;
