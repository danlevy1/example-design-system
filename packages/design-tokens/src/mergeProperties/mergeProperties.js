const { resolve, extname } = require("path");
const { readdir, readFile, stat, writeFile, mkdir } = require("fs/promises");
const merge = require("deepmerge");

/**
 * Gets all files, including nested files, starting at the passed directory
 * Original source: https://stackoverflow.com/a/45130990/6063755
 * @param {String} directory - The directory to begin recursing from
 * @returns {Promise<String[]>} An array of file paths
 */
const getFilePaths = async (directory) => {
    // Gets the subdirectories and files one level deep inside of the passed directory
    const directoryChildrenNames = await readdir(directory);

    // Gets all of the nested files (unlimited depth) as multi-dimensional array
    const filePaths = await Promise.all(
        directoryChildrenNames.map(async (directoryChildName) => {
            const directoryChildPath = resolve(directory, directoryChildName);

            let isDirectoryChildADirectory;
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
 * @returns {Promise<string>} A JSON formatted string of all properties
 */
const mergePropertyFiles = async () => {
    console.log("Merging properties...");

    const rootPropertiesDirectory = resolve(__dirname, "../properties");

    const filePaths = await getFilePaths(rootPropertiesDirectory);

    const files = await Promise.all(
        filePaths.map(async (filePath) => {
            if (filePath) {
                const file = await readFile(filePath, "utf8");
                return JSON.parse(file);
            }

            return null;
        })
    );

    const mergedProperties = merge.all(files);
    const mergedPropertiesString = JSON.stringify(mergedProperties);

    console.log("Successfully merged properties.\n");

    return mergedPropertiesString;
};

/**
 * Writes the given JSON formatted string to a dist file
 * @param {String} mergedProperties A JSON formatted string of all properties
 * @returns {Promise<void>}
 */
const writeDistFile = async (mergedProperties) => {
    console.log("Writing to the dist directory...");

    const outputFilePath = resolve(__dirname, "../../dist");

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

module.exports = mergeProperties;
