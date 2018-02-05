/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	/* global AFRAME */

	if (typeof AFRAME === 'undefined') {
	  throw new Error('aframe-event-decorators was loaded before AFRAME was available');
	}

	const eventBinder = __webpack_require__(1);
	const decorate = __webpack_require__(2).decorate;

	module.exports.bindEvent = eventBinder.bindEvent;
	module.exports.bindEventPlayPause = eventBinder.bindEventPlayPause;
	module.exports.decorate = decorate;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/*
	 * Provides a decorator functor for annotating functions in Component definitions so that they are automatically
	 * bound and unbound from events without needing to call el.addEventListener or el.removeEventListener yourself.
	 *
	 * Decorations should be made in the Components definition object. Here is the simplest example:
	 *
	 * const {bindEvent} = require('event-binder');
	 *
	 * AFRAME.registerComponent("foo", {
	 *   componentchanged: bindEvent( function(evt) {
	 *     console.log(evt.detail);
	 *   })
	 * })
	 *
	 * By default the function will be bound to events corresponding to its property name, in this case: 'componentchanged'.
	 * It will listen for events on its parent element, and will begin listening or end listening when init or remove is
	 * called. However this can also be configured by passing a configuration object:
	 *
	 * AFRAME.registerComponent("foo", {
	 *   whenSceneLoads: bindEvent( {
	 *     event: "loaded",    // Event to listen for. Defaults to functions propery name.
	 *     target: "a-scene",  // Selector string for which element to listen on, defaults to this.el
	 *     listenIn: "init",   // Which function addEventListener is called in, defaults to 'init'
	 *     removeIn: "remove", // Which function removeEventListener is called in, defaults to 'remove'
	 *   }, function(evt) {
	 *     console.log(evt.detail);
	 *   })
	 * })
	 *
	 * Functions will only be bound to events when a new component is created. Decorating a function with bindEvent()
	 * in a components init, or tick functions for example will have no effect.
	 *
	 * Don't bind to arrow functions because they don't have their own this.
	 *
	 */

	const decorate = __webpack_require__(2).decorate;

	// Implements the automatic binding and unbinding of the chosen function. Wraps its listenIn and removeIn
	// functions to add and remove the event listener at the correct times.
	function BindToEventDecorator(_event, _target, _listenIn, _removeIn) {
	  return function(propertyName, func) {
	    const scope = this;
	    const event = _event || propertyName;
	    const target = !_target ? this.el : document.querySelector(_target);
	    if (!target) {
	      console.warn("Couldn't subscribe "+this.name+"."+propertyName+" to "+event+" on "+_target
	        +" because querySelector returned undefined.");
	      return;
	    }
	    const listenIn = _listenIn || "init";
	    const removeIn = _removeIn || "remove";

	    const listenFunc = this[listenIn];
	    const removeFunc = this[removeIn];
	    const boundFunc = func.bind(this);
	    
	    this[listenIn] = function() {
	      if (listenFunc !== undefined) {
	        listenFunc.apply(scope, arguments);
	      }
	      target.addEventListener(event, boundFunc);
	    }

	    this[removeIn] = function() {
	      if (removeFunc !== undefined) {
	        removeFunc.apply(scope, arguments);
	      }
	      target.removeEventListener(event, boundFunc);
	    }

	    return func;
	  }
	}

	/*
	 * Decorates a function with configurations for automatically binding to an event.
	 *
	 * @param p1 - If this is a function it will be decorated with default options and p2 is ignored. Otherwise this can be
	 *   an object which fine tunes the binding.
	 * @param p2 - If p1 is an object then this will be the function to bind to.
	 *
	 * @returns {function} Decorated function which wraps the input function.
	 */
	function bindEvent(p1, p2) {
	  if (typeof p1 === "function") {
	    return decorate(p1, BindToEventDecorator());
	  } else if (typeof p1 === "object" && typeof p2 === "function") {
	    return decorate(p2, BindToEventDecorator(p1.event, p1.target, p1.listenIn, p1.removeIn));
	  } else {
	    throw new Error("bindEvent must take: (function), or a ([object], function)")
	  }
	}

	/*
	 * Convenience function, will always bind/unbind listener in play/pause function, rather than the default init/remove
	 */
	function bindEventPlayPause (p1, p2) {
	  if (typeof p1 === "function") {
	    return decorate(p1, BindToEventDecorator(undefined, undefined, "play", "pause"));
	  } else if (typeof p1 === "object" && typeof p2 === "function") {
	    return decorate(p2, BindToEventDecorator(p1.event, p1.target, "play", "pause"));
	  } else {
	    throw new Error("bindEventPlayPause must take: (function), or a ([object], function)")
	  }
	}

	module.exports.bindEvent = bindEvent;
	module.exports.bindEventPlayPause = bindEventPlayPause;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	/* global AFRAME */

	/*
	 * Provides a simple API for creating decorator functions which you can apply to your Component definitions.
	 * These decorated functions are executed when their Component is instantiated, and have their 'this' attribute set
	 * to the new Component.
	 *
	 * Decorators should only be used on functions that are owned by Component descriptors registered with
	 * AFRAME.registerComponent. Decorating any other function will have no effect, as the decorator
	 * functor will never be executed.
	 */

	/*
	 * Decorates a function with a functor that is executed in the context of each instantiated Component which owns it.
	 *
	 * @param func - Function to decorate.
	 * @param decoratorFunc - Functor which decorates func. It's definition should appear like this:
	 *    function decoratorFunctor(funcPropertyName) {
	 *      const func = this[funcPropertyName]; // 'this' is assigned to the instantiated Component.
	 *      // Decorator should return a function
	 *      return () => {
	 *        console.log(this.el.id + " has a decorated function!");
	 *        return func.apply(this, arguments);
	 *      }
	 *    }
	 *
	 * @returns A pending decorated functor which will be executed when a component that owns it is instantiated.
	 */
	function decorate(func, decoratorFunc) {
	  return decorations.add(func, decoratorFunc);
	}

	// Helper for storing and retrieving decorator functors for a given function.
	const decorations = (function() {
	  const funcMap = new WeakMap();

	  function add(func, decorator) {
	    const parent = funcMap.has(func) ? func : undefined; // In case decorators are nested.
	    const decoratedFunc = function() {
	      func.apply(this, arguments);
	    }
	    funcMap.set(decoratedFunc, {parent: parent, decorator: decorator});
	    return decoratedFunc;
	  }

	  function getAll(func) {
	    var iter = funcMap.get(func);
	    var decorators = [];
	    while (iter !== undefined) {
	      decorators.push(iter.decorator);
	      iter = iter.parent;
	    }
	    return decorators;
	  }

	  function isFunctionDecorated(func) {
	    return funcMap.has(func);
	  }

	  return {
	    add: add,
	    getAll: getAll,
	    isFunctionDecorated: isFunctionDecorated
	  }
	})();

	// Here I'm wrapping the AFRAME.registerComponent function and also each Component constructor. Whenever a new component
	// is instantiated I'm scanning its list of properties for any functions which have been decorated. Each decoration
	// functor will then be executed in the context of the component which owns the function.
	(function() {
	  Object.keys(AFRAME.components).forEach( function(c) {
	    wrapComponent(c)
	  });
	  wrapRegister();

	  function executeDecoratorsOnNewComponent(component) {
	    const prot = Object.getPrototypeOf(component);
	    Object.getOwnPropertyNames(prot).forEach( function(name) {
	      const prop = prot[name];
	      if (typeof prop === "function" && decorations.isFunctionDecorated(prop)) {
	        decorations.getAll(prop).forEach(function(decorator) {
	          component[name] = decorator.call(component, name, prop);
	        });
	      }
	    });
	  }

	  function wrapComponent(name) {
	    const orig = AFRAME.components[name].Component;

	    AFRAME.components[name].Component = function() {
	      // Override init on the instance to execute the decorator functors before initializing.
	      this.init = function() {
	        delete this.init;
	        executeDecoratorsOnNewComponent(this);
	        this.init.apply(this, arguments);
	      }
	      orig.apply(this, arguments);
	    }
	    AFRAME.components[name].Component.prototype = orig.prototype;
	  }

	  function wrapRegister() {
	    const origRegister = AFRAME.registerComponent;
	    AFRAME.registerComponent = function(name) {
	      origRegister.apply(AFRAME, arguments);
	      return wrapComponent(name);
	    }
	  }
	})();

	module.exports.decorate = decorate;

/***/ })
/******/ ]);