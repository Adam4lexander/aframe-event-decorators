/* global AFRAME */

if (typeof AFRAME === 'undefined') {
  throw new Error('aframe-event-decorators was loaded before AFRAME was available');
}

const eventBinder = require("./event-binder");
const decorate = require("./component-decorators").decorate;

module.exports.bindEvent = eventBinder.bindEvent;
module.exports.bindEventPlayPause = eventBinder.bindEventPlayPause;
module.exports.decorate = decorate;