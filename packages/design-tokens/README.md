# Design Tokens

[![NPM](https://img.shields.io/npm/l/@x3r5e/design-tokens?color=blue&style=for-the-badge)](https://github.com/danlevy1/example-design-system/blob/main/packages/design-tokens/LICENSE)
[![npm (scoped)](https://img.shields.io/npm/v/@x3r5e/design-tokens?color=blue&style=for-the-badge)](https://www.npmjs.com/package/@x3r5e/design-tokens)
[![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@x3r5e/design-tokens?style=for-the-badge)](https://libraries.io/npm/@x3r5e%2Fdesign-tokens)
[![npm](https://img.shields.io/npm/dm/@x3r5e/design-tokens?style=for-the-badge)](https://www.npmjs.com/package/@x3r5e/design-tokens)

Design tokens are the smallest style atoms that the design system and it's dependecies rely on. If you use this design system to build out your UI, use of these design tokens ensures that you keep your design system within the recommended constraints of style guidelines. The components in the design system almost exclusively rely on these design tokens.

## Installation

Installation is easy; simply install the npm package in your project:

```
npm install --save-dev @x3r5e/design-tokens
```

The above command assumes that you will be using the design tokens package as a develpment dependency. To install the package as a regular dependency (i.e. a production dependency), run:

```
npm install --save @x3r5e/design-tokens
```

## Usage

The design tokens library offers a simple API for those who are either looking to test the package out or don't have a complex use case. For advanced use-cases, your only technical constraint is that the tokens are in JSON fromat.

### Simple - Using the API

The API currently creates one (1) file with every design token for each platform you want to build for. The API is available in CommonJS format or ES Module format. The API is also TypeScript-ready. For the documentation here, we assume you are using JavaScript and CommonJS, but the code is very similar if you choose to use ES Modules.

```javascript
// Imports the `buildDesignTokens` API and the `PlatformOptions` object (i.e. enum)
const { buildDesignTokens, PlatformOptions } = require("@x3r5e/design-tokens");
```

Out of the box, we currently support the following platforms, which are seen inside of the `PlatformOptions` object/enum:

1. CSS
2. SCSS
3. LESS
4. ESM (JS in ES Module format)
5. CJS (JS in CommonJS format)
6. JSON

The `buildDesignTokens` function is an asynchronous function that accetps two (2) parameters and returns a `Promise` that either resolves with no information or rejects with an error:

1. An array of platforms (see the above supported platforms) [required]
2. An array of source paths [optional]. If no source path(s) are provided, the path defaults to the `properties` directory in the libraray's `dist` directory`. It's likely that you won't need to pass in an array of source paths because you'll just want the provided tokens (i.e. properties) to be used.

The platforms array expects an array of objects where each object is of the following (this is a TypeScript type definition):

```typescript
type Platform = {
    name: PlatformOptions;
    destinationPath: string;
    destinationFilename: string;
};
```

`Platform.name` expects a value from the `PlatformOptions` object/enum. [Required]

```javascript
// Example
const { PlatformOptions } = require("@x3r5e/design-tokens");

const cssPlatform = {
    name: PlatformOptions.CSS,
};
```

`Platform.destinationPath` expects absolute path to the destination directory where the design tokens file will be generated. The path needs a trailing "/". [Required]

```javascript
// Example
const path = require("path");

const cssPlatform = {
    destinationPath: `${__dirname}/`, // Notice the trailing slash at the end
};
```

`Platform.destinationFilename` expects the filename for the generated design tokens. The filename will be appended to the `destinationPath` when the build process runs. [Required]

```javascript
// Example
const cssPlatform = {
    destinationFilename: "tokens.css",
};
```

The following code will produce a file called `tokens.css` in the same directory that this JavaScript file is in:

```javascript
// Complete Example
const { buildDesignTokens, PlatformOptions } = require("@x3r5e/design-tokens");

const cssPlatform = {
    name: PlatformOptions.CSS,
    destinationPath: `${__dirname}/`,
    destinationFilename: "tokens.css",
};

const platforms = [cssPlatform];

buildDesignTokens(platforms);
```

You can add more platforms by adding more objects to the `platforms` array.

### Complex - Using Your Own Build Process

If the provided API (explained above) does not offer enough flexibility, you can use any build process that you'd like. Under the hood of the provided API, [Style Dictionary](https://amzn.github.io/style-dictionary/) is used to:

1. Deep merge all of the property files in the library's `dist/properties` directory.
2. Resolve any token aliases (see [alias](https://amzn.github.io/style-dictionary/#/properties?id=attribute-reference-alias)).
3. Output the tokens into files using syntax based on the provided `platform`(s).

Item #2 above is especially important if you want to use your own build process (even if you use Style Dictionary). The tokens and build process of the API that we provide go hand-in-hand. The token aliases are set up in a way such that the build process can resolve them to the alias' value. In order to ensure that your build process handles the aliases the right way, we recommand using the following code that leverages the API to create a deep merged property object with all aliases resolved to their respective values. Once the `buildDesignTokens` function finishes (remember, the function is asynchronous), you can then ingest the single output JSON file using your build process.

```javascript
// Merge all properties (i.e. tokens) into a single file and resolve all property aliases
const { buildDesignTokens, PlatformOptions } = require("@x3r5e/design-tokens");

const mergeTokensAndResolveAliases = async () => {
    const cssPlatform = {
    name: PlatformOptions.JSON,
    destinationPath: `${__dirname}/`,
    destinationFilename: "tokens.json",
    };

    const platforms = [cssPlatform];

    await buildDesignTokens(platforms);
}

mergeTokensAndResolveAliases()
    .then(() => /* Run custom build process using `tokens.json` file*/)
    .catch((error) => /* If applicable, do something with the error */)
```

If you need to create your own build process, we recommend checking out [Style Dictionary](https://amzn.github.io/style-dictionary/) as it is very flexible.

## Contributing

We are not currently accepting contributions to this repository.
