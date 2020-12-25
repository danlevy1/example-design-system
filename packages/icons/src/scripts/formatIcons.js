/*
1. Add https://www.npmjs.com/package/svgson as a dev dependency
2. Remove "width" and "height" attributes from <svg> element. Any component library (e.g. `react-components`) that ingests the icons should dynamically add the width and height attributes based on offered sizes.
3. Remove the "fill" attribute from all elements (including nested elements). If any of the elements use `stroke` attribute, throw an error because all elements need to use the `fill` attribute.
*/
