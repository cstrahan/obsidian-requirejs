# Obsidian RequireJS Plugin

This Obsidian (https://obsidian.md) plugin makes it easy to write reusable JavaScript code using [requirejs](https://requirejs.org/).

For example, I could set the script folder to `_files/scripts`, and then I could copy [lodash](https://lodash.com/) to `_files/scripts/lodash.js`.

From a [dataview](https://github.com/blacksmithgu/obsidian-dataview) `dataviewjs` block, I could use it like so:

```js
const requirejs = window.requirejs;
const lodash = await new Promise((resolve, reject) => requirejs(['lodash'], resolve, reject));
lodash.get(...) // now I can use lodash
```

If I want to develop some of my own utility functions, I can do something like so:

```js
// in _files/scripts/utils.js
define(['exports'], function(exports) {
    // cheesy examples, but you get the idea
    exports.multiply = (x,y) => x*y;
    exports.add = (x,y) => x+y;
    exports.sub = (x,y) => x-y;
});
```

```js
const requirejs = window.requirejs;
const myUtils = await new Promise((resolve, reject) => (['utils'], resolve, reject));
console.log(myUtils.add(myUtils.multiply(3, 4), 12));
```

Modules can have dependencies on each other. I can define another module like so:

```js
// in _files/scripts/more-utils.js
define(['exports', 'utils'], function(exports, utils) {
    exports.foobar = (x,y,z) => utils.add(x, utils.multiply(y, z));
});
```

For more details on this module syntax ([Asynchronous Module Definition](https://requirejs.org/docs/whyamd.html), specifically) see the RequireJS docs: https://requirejs.org/docs/api.html

This project was inspired by https://github.com/SamLewis0602/obsidian-custom-js.

## Help Wanted

- [ ] Code clean up
- [ ] Auto-complete suggestions when choosing script folder option

## How to use

- Clone this repo.
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.
