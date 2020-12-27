# Icons

[![NPM](https://img.shields.io/npm/l/@x3r5e/icons?color=blue&style=for-the-badge)](https://github.com/danlevy1/example-design-system/blob/main/packages/icons/LICENSE)
[![npm (scoped)](https://img.shields.io/npm/v/@x3r5e/icons?color=blue&style=for-the-badge)](https://www.npmjs.com/package/@x3r5e/icons)
[![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@x3r5e/icons?style=for-the-badge)](https://libraries.io/npm/@x3r5e%2Ficons)
[![npm](https://img.shields.io/npm/dm/@x3r5e/icons?style=for-the-badge)](https://www.npmjs.com/package/@x3r5e/icons)

This package contains SVG files. Each component library implementation will need its own icon-to-component converter.

## Installation

Installation is easy; simply install the npm package in your project:

```
npm install --save-dev @x3r5e/icons
```

The above command assumes that you will be using the icons package as a develpment dependency. To install the package as a regular dependency (i.e. a production dependency), run:

```
npm install --save @x3r5e/icons
```

## Usage

1. Import the package

```javascript
// Imports the `getIconFilePaths` function
const { getIconFilePaths } = require("@x3r5e/icons");
```

2. Execute the `getIconFilePaths` function to get an array of absolute paths to the icon files.

```javascript
// Gets an array of absolute paths (one path per icon)
const absoluteFilePaths = getIconFilePaths();
```

3. Use your importer of choice (e.g. `require`, `import`, `fs.readFile`) to get the SVG file contents.
