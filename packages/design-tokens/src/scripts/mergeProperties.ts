const { resolve, extname } = require("path");
const { readdir, readFile, stat, writeFile, mkdir } = require("fs").promises;
const merge = require("deepmerge");

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
                const directoryChildStats = await stat(directoryChildPath);
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
                const isJSONFile: boolean =
                    extname(directoryChildPath) === ".json";

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
 * @returns A JSON formatted string of all properties
 */
const mergePropertyFiles = async (): Promise<string> => {
    console.log("Merging properties...");

    const rootPropertiesDirectory: string = resolve(__dirname, "../properties");

    const filePaths = await getFilePaths(rootPropertiesDirectory);

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
 * @param mergedProperties A JSON formatted string of all properties
 */
const writeDistFile = async (mergedProperties: string): Promise<void> => {
    console.log("Writing to the dist directory...");

    const outputFilePath: string = resolve(__dirname, "../../dist");

    await mkdir(outputFilePath, { recursive: true });

    await writeFile(`${outputFilePath}/properties.json`, mergedProperties);

    console.log("Successfully wrote to the dist directory.\n");
};

const mergeProperties = async () => {
    console.log("--- Running design token build script ---\n");

    const mergedProperties = await mergePropertyFiles();
    await writeDistFile(mergedProperties);

    console.log("--- Design token build script successfully completed ---");
};

module.exports = { mergeProperties };
