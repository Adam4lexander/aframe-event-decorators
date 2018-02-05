## aframe-event-decorators-component

[![Version](http://img.shields.io/npm/v/aframe-event-decorators.svg?style=flat-square)](https://npmjs.org/package/aframe-event-decorators-component)
[![License](http://img.shields.io/npm/l/aframe-event-decorators.svg?style=flat-square)](https://npmjs.org/package/aframe-event-decorators-component)

Decorate component functions to have them automatically subscribe/unsubscribe to events.

For [A-Frame](https://aframe.io).

### API

| Property | Description | Default Value |
| -------- | ----------- | ------------- |
|          |             |               |

### Installation

#### Browser

Install and use by directly including the [browser files](dist):

```html
<head>
  <title>My A-Frame Scene</title>
  <script src="https://aframe.io/releases/0.6.0/aframe.min.js"></script>
  <script src="https://unpkg.com/aframe-event-decorators/dist/aframe-event-decorators.min.js"></script>
</head>

<body>
  <a-scene>
    <a-entity event-decorators="foo: bar"></a-entity>
  </a-scene>
</body>
```

#### npm

Install via npm:

```bash
npm install aframe-event-decorators
```

Then require and use.

```js
require('aframe');
require('aframe-event-decorators');
```
