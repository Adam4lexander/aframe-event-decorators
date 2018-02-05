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

const decorate = require('./component-decorators').decorate;

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