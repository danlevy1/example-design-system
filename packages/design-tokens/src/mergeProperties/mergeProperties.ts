import { resolve, extname } from "path";
import { readdir, readFile, stat, writeFile, mkdir } from "fs/promises";
import merge from "deepmerge";

/**
 * Gets all files, including nested files, starting at the passed directory
 * Original source: https://stackoverflow.com/a/45130990/6063755
 * @param directory - The directory to begin recursing from
 * @returns An array of file paths
 */
const getFilePaths = async (directory: string): Promise<string[]> => {
    // Gets the subdirectories and files one level deep inside of the passed directory
    const directoryChildrenNames: string[] = await readdir(directory);

    // Gets all of the nested files (unlimited depth) as multi-dimensional array
    const filePaths: (string | string[])[] = await Promise.all(
        directoryChildrenNames.map(async (directoryChildName) => {
            const directoryChildPath: string = resolve(
                directory,
                directoryChildName
            );

            let isDirectoryChildADirectory: boolean;
            try {
                const directoryChildStats: {
                    isDirectory: () => boolean;
                } = await stat(directoryChildPath);
                isDirectoryChildADirectory = directoryChildStats.isDirectory();
            } catch (e) {
                throw new Error(
                    `Can't get file/directory stats for path ${directoryChildPath}.\n${e}`
                );
            }

            if (isDirectoryChildADirectory) {
                const nestedFilePaths = await getFilePaths(directoryChildPath);
                return nestedFilePaths;
            } else {
                const isJSONFile = extname(directoryChildPath) === ".json";

                if (!isJSONFile) {
                    throw new Error(
                        `The following file does not have the required extension ".json": ${directoryChildPath}`
                    );
                } else {
                    return directoryChildPath;
                }
            }
        })
    );

    // Flattens the files list and returns it
    return filePaths.flat();
};

/**
 * Deep merges properties from all property files into one JSON string
 * @param outputDir - The directory of the input property files
 * @returns A JSON formatted string of all properties
 */
const mergePropertyFiles = async (inputDir: string): Promise<string> => {
    console.log("Merging properties...");

    const filePaths = await getFilePaths(inputDir);

    const files: object[] = await Promise.all(
        filePaths.map(async (filePath) => {
            if (filePath) {
                const file = await readFile(filePath, "utf8");
                return JSON.parse(file);
            }

            return null;
        })
    );

    const mergedProperties: object = merge.all(files);
    const mergedPropertiesString = JSON.stringify(mergedProperties);

    console.log("Successfully merged properties.\n");

    return mergedPropertiesString;
};

/**
 * Writes the given JSON formatted string to a dist file
 * @param outputDir - The directory to output the merged properties file to
 * @param mergedProperties A JSON formatted string of all properties
 */
const writeDistFile = async (mergedProperties: string, outputDir: string) => {
    console.log("Writing to the dist directory...");

    await mkdir(outputDir, { recursive: true });
    await writeFile(`${outputDir}/properties.json`, mergedProperties);

    console.log("Successfully wrote to the dist directory.\n");
};

/**
 * Merges design token properties into a single file.
 * @param inputDir - The directory of the input property files
 * @param outputDir - The directory to output the merged properties file to
 */
const mergeProperties = async (inputDir: string, outputDir: string) => {
    console.log("--- Running design token build script ---\n");

    const mergedProperties = await mergePropertyFiles(inputDir);
    await writeDistFile(mergedProperties, outputDir);

    console.log("--- Design token build script successfully completed ---");
};

export default mergeProperties;
