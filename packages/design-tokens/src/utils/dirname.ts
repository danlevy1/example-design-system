import { dirname } from "path";
import { fileURLToPath } from "url";

const getDirname = (fileURL: string) => {
    const __dirname = dirname(fileURLToPath(fileURL));
    return __dirname;
};

export default getDirname;
