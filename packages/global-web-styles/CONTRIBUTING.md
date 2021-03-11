# Contributing to `@x3r5e/global-web-styles`

The goal of this package is to include a very **minimal** set of opinionated global styles.

## Linting

We have set up opinionated formatting and linting using Prettier, ESLint, and stylelint. Our CI system will catch any linting errors. All linting errors must be resolved before the pull request can be merged. If you are using VSCode, we recommend using extensions for Prettier, ESLint, and stylelint. Also, by checking the `Format on Save` option in VSCode's settings, you can likely resolve most formatting and linting errors just by saving the file.

## Versioning

We follow the [Semantic Versioning v2.0.0](https://semver.org) spec.

## Commit Messages

We try our best to follow [Conventional Commits v1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) for our git commit messages.

## FAQ

> Why does this package not use a CSS reset or normalize file?

We purposefully _don't_ use a CSS reset or normalize file because we make the assumption that all HTML elements will be styled anyways. As an example, some browsers might use different margins for the `<h1>` element. A CSS reset or normalize file will set a specific margin that all browsers will respect. Then, a developer will go in and style the `<h1>` element to their liking, and this will likely result in them using a different margin than the CSS reset or normalize file uses. At the end of the day, the styles in the CSS reset or normalize file just get overridden by styles with higher specificity.
