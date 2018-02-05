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