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
const { getSvgIcons } = require("@x3r5e/icons");
```

2. Execute the `getSvgIcons` function. The function returns a `promise` that, if resolved, returns a map where the keys are the icon names (e.g. `CheckIcon`) and the values are the icon SVGs.

```javascript
// Gets the icon SVGs
getSvgIcons()
    .then((svgIcons) => console.log(svgIcons))
    .catch((error) => console.log(error));
```

3. Use the icon name (key) as the component name and render the icon SVG (value).

### Important Note

The `width` and `height` attributes are purposefully omitted from the SVGs. Make sure that you add those properties to the SVG when rendering it. This is useful when your icon component has a fixed number of sizes (e.g. `small = 18px`, `medium = 24px`, and `large = 30px`).
