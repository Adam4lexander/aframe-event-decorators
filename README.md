## aframe-event-decorators

[![Version](http://img.shields.io/npm/v/aframe-event-decorators.svg?style=flat-square)](https://npmjs.org/package/aframe-event-decorators-component)
[![License](http://img.shields.io/npm/l/aframe-event-decorators.svg?style=flat-square)](https://npmjs.org/package/aframe-event-decorators-component)

Decorate component functions to have them automatically subscribe/unsubscribe to events.

For [A-Frame](https://aframe.io).

### API

Decorate your functions in your Component definitions to make them bind and unbind from events automatically. With this package there is no need to call addEventListener/removeEventListener, just create normal functions in your components
augmented with a decorator functor.

Decorate your functions before calling *AFRAME.registerComponent*. Here is the simplest example:

```javascript
const bindEvent = require('aframe-event-decorators').bindEvent;

AFRAME.registerComponent("foo", {
  componentchanged: bindEvent( function(evt) {
    console.log(evt.detail);
  })
})
```

By default the function will be bound to events corresponding to its property name, in this case: 'componentchanged'. It will listen for events on its parent element, and will begin listening or end listening when init or remove is called. However this can also be configured by passing a configuration object:

```javascript
AFRAME.registerComponent("foo", {
  whenSceneLoads: bindEvent( {
    event: "loaded",    // Event to listen for. Defaults to functions propery name.
    target: "a-scene",  // Selector string for which element to listen on, defaults to this.el
    listenIn: "init",   // Which function addEventListener is called in, defaults to 'init'
    removeIn: "remove", // Which function removeEventListener is called in, defaults to 'remove'
  }, function(evt) {
    console.log(evt.detail);
  })
})
```
There is also the *bindEventPlayPause* convenience decorator which will always bind/unbind in play and pause respectively.

Functions will only be bound to events when a new component is created. Decorating a function with bindEvent() in a components init, or tick functions for example will have no effect. Don't bind to arrow functions because they don't have their own *this* attribute.

### Installation

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

### Create your own decorators

This next bit may or may not be useful to anyone. You dont need to know any of what follows to use the event decorators.

I've also exposed an abstract component decorator system so you can create your own decorators. These decorators are special because they are only executed when a component is instantiated, with their *this* attribute is set to the new instance. The event binding decorators are built on top of this. Here's an example:

```javascript
const decorate = require('aframe-event-decorators').decorate;

// It's useful to wrap the Functor object to create a closure with any data, such as this 'message' parameter.
function sayHello(message, targetFunction) {

  // This function will be executed when the component which has a decorated function is instanciated. 'this' will be set
  // to the component and 'funcPropertyName' is the property name which maps to the decorated function. The functor should
  // return a function.
  function Functor(funcPropertyName) {
    const func = this[funcPropertyName]; // 'this' is assigned to the instantiated Component.
    // Decorator should return a function
	return function() {
	  console.log(this.el.id + " has a decorated function with message: " + message);
	  return func.apply(this, arguments);
	}
  }

  return decorate(
  	targetFunction,	// The component function to decorate
  	functor         // The functor which is executed on the target function.
  )
}

// Now are new decorator 'sayHello' is ready to be used in a Component definition.
AFRAME.registerComponent("foo", {
  play: sayHello("flimflam", function(){
  	console.log("component is playing.");
  })
})

// Now whenever the 'foo' component is added to an Entity its play function is augmented with a message that has details
// about the component instance!
```