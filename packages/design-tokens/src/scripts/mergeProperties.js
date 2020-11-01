// Package imports
const { resolve, extname } = require("path");
const { readdir, stat, writeFile } = require("fs").promises;
const merge = require("deepmerge");

/**
 * Gets all files, including nested files, starting at the passed directory
 * Original source: https://stackoverflow.com/a/45130990/6063755
 * @param {String} directory - The directory to begin recursing from
 * @returns {Promise<String[] | Error>} Either an array of file paths or an error
 */
const getFilePaths = async (directory) => {
    // Gets the subdirectories and files one level deep inside of the passed directory
    const directoryChildrenNames = await readdir(directory);

    // Gets all of the nested files (unlimited depth) as multi-dimensional array
    const filePaths = await Promise.all(
        directoryChildrenNames.map(async (directoryChildName) => {
            const directoryChildPath = resolve(directory, directoryChildName);

            const isDirectoryChildADirectory = (
                await stat(directoryChildPath)
            ).isDirectory();

            if (isDirectoryChildADirectory) {
                return getFilePaths(directoryChildPath);
            } else {
                const isJSONFile = extname(directoryChildPath);

                if (!isJSONFile) {
                    console.warn(
                        `The following file was not added to the list because its extension is not ".json": ${directoryChildPath}`
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
 * @returns {Promise<String | Error>} Either a JSON formatted string of all properties or an error
 */
const mergePropertyFiles = async () => {
    console.log("Merging properties...");
    const rootPropertiesDirectory = resolve(__dirname, "../properties");

    const filePaths = await getFilePaths(rootPropertiesDirectory);

    const files = filePaths.map((filePath) => {
        return require(filePath);
    });

    const mergedProperties = merge.all(files);

    console.log("Successfully merged properties.\n");

    return JSON.stringify(mergedProperties);
};

/**
 * Writes the given JSON formatted string to a dist file
 * @param {String} mergedProperties A JSON formatted string of all properties
 */
const writeDistFile = async (mergedProperties) => {
    console.log("Writing to the dist directory...");

    const outputFilePath = resolve(__dirname, "../../dist/properties.json");

    await writeFile(outputFilePath, mergedProperties);

    console.log("Successfully wrote to the dist directory.\n");
};

console.log("--- Running design token build script ---\n");

mergePropertyFiles()
    .then((mergedProperties) => writeDistFile(mergedProperties))
    .then(() =>
        console.log("--- Design token build script successfully completed ---")
    )
    .catch((error) => console.error(error));
