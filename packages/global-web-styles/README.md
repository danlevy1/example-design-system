# Global Web Styles

[![NPM](https://img.shields.io/npm/l/@x3r5e/global-web-styles?color=blue&style=for-the-badge)](https://github.com/danlevy1/example-design-system/blob/main/packages/global-web-styles/LICENSE)
[![npm (scoped)](https://img.shields.io/npm/v/@x3r5e/global-web-styles?color=blue&style=for-the-badge)](https://www.npmjs.com/package/@x3r5e/global-web-styles)
[![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@x3r5e/global-web-styles?style=for-the-badge)](https://libraries.io/npm/@x3r5e%2Fglobal-web-styles)
[![npm](https://img.shields.io/npm/dm/@x3r5e/global-web-styles?style=for-the-badge)](https://www.npmjs.com/package/@x3r5e/global-web-styles)

Global web styles are degined to be the foundation of all CSS styles across a website or web application. The styles _are_ opinionated, but are also minimal by design. In this particular package, the only opinions are:

1. The Font: Roboto
2. Box Sizing: `border-box`

These global styles are written in a such a way that they can be overridden at any time, for any HTML element(s).

## Installation

Installation is easy; simply install the npm package in your project:

```
npm install --save @x3r5e/design-tokens
```

## Usage

This package contains just one CSS file. There are a variety of ways to import CSS files into your website or web app. Below are just a few options.

### Use the HTML `<link>` Element

The HTML External Resource Link Element (`<link>`) is the easiest way to pull in a CSS file. In your `index.html` file, add the following `<link>` inside of your `<head>` element:

```html
<link
    rel="stylesheet"
    href="./relative-path-to-node_modules/@x3r5e/global-web-styles/dist/index.css"
/>
```

### Use CSS Modules

If you want to import the CSS file into a JavaScript file using [CSS Modules](https://github.com/css-modules/css-modules), add the following import statement:

```javascript
import "@x3r5e/global-web-styles";
```

The CSS file is the main export of the package, so the above `import` statement is similar to importing a CSS file such as:

```javascript
import "index.css";
```

As a reminder, CSS Modules is not a part of JavaScript. This means that you will need to use a bundler such as [Webpack](https://webpack.js.org), and potentially plugin(s) that understand CSS Modules as well.

## FAQ

> Does the `@x3r5e/react-components` package come with `@x3r5e/global-web-styles` by default?

No, `@x3r5e/react-components` does _not_ come with `@x3r5e/global-web-styles` by default. In theory, you could choose to create your own global styles instead of using this opinionated package. If you choose to go this route, we insist that you at least use `box-sizing: border-box` for all of your elements. If you don't use `border-box`, the React components might render in unexpected ways that lead to layout issues on your page. The main reason to _not_ use this package is if you want to use your own font(s). Because this package imports font(s) by default, you would end up downloading multiple sets of fonts and some font(s) might never get used. Downloading assets that are never used is poor practice. We chose to include a font as part of this package because the font works well stylistically with the component styles. If you decide to use your own font, or otherwise decide not to use this package, be sure to take a look at the `index.css` file in the `dist` directory of this package to make sure that you include important global styles such as `box-sizing: border-box`.

## Contributing

We are not currently accepting contributions to this repository.
