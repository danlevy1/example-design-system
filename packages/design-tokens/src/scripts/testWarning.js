const chalk = require("chalk");

process.stderr.write(
    chalk.bold.hex("F79862")(
        "|---------------------------------------------------------------------------------------------------------------------------------|\n| !! Some test files mock console.log, so you might need to use the original console.log for the log to appear in the terminal !! |\n|---------------------------------------------------------------------------------------------------------------------------------|\n\n"
    )
);
