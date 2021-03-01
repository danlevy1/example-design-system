# Icons

[![NPM](https://img.shields.io/npm/l/@x3r5e/icons?color=blue&style=for-the-badge)](https://github.com/danlevy1/example-design-system/blob/main/packages/icons/LICENSE)
[![npm (scoped)](https://img.shields.io/npm/v/@x3r5e/icons?color=blue&style=for-the-badge)](https://www.npmjs.com/package/@x3r5e/icons)
[![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@x3r5e/icons?style=for-the-badge)](https://libraries.io/npm/@x3r5e%2Ficons)
[![npm](https://img.shields.io/npm/dm/@x3r5e/icons?style=for-the-badge)](https://www.npmjs.com/package/@x3r5e/icons)

This package contains SVG files. Each component library implementation will need its own icon-to-component converter.

## Installation

Install the npm package in your project:

```
npm install --save-dev @x3r5e/icons
```

## Usage

Import the icon(s) that you need from the package

```javascript
// `icons` is an object where each key corresponds to an SVG as a string
const icons = require("@x3r5e/icons");
```

### Important Note

The `width` and `height` attributes are purposefully omitted from the SVGs. Make sure that you add those properties to the SVG when rendering it. This is useful when your icon component has a fixed set of sizes (e.g. `small = 18px`, `medium = 24px`, and `large = 30px`).
