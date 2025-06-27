# Simple Framework JS

A simple backend framework using js and mysql for [Node.js](https://nodejs.org).

## Features

- Minimal setup and clean syntax
- Built-in routing
- MySQL database support
- Designed for learning and lightweight APIs

```js
import { SimpleFramework } from "simple_framework_js";

const app = new SimpleFramework();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000);
```

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/).

Before installing, [download and install Node.js](https://nodejs.org/en/download/).
Node.js 20 or higher is required.

If this is a brand new project, make sure to create a `package.json` first with
the [`npm init` command](https://docs.npmjs.com/creating-a-package-json-file).

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
npm i simple_framework_js
```

## License

[MIT](LICENSE)
