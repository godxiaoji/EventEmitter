/**
 * EventEmitter for browser
 * @author  Travis [godxiaoji@gmail.com]
 * @version 1.0.3
 * 
 * @see https://nodejs.org/api/events.html
 */

/*
 Supported export methods:
 * AMD
 * Miniprogram
 * <script> (window.EventEmitter)
 * Node.js
*/

// Module definition pattern used is returnExports from https://github.com/umdjs/umd
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.EventEmitter = factory();
  }
}(typeof self !== 'undefined' ? self : this, (function () {
  'use strict';

  function isArray(value) {
    return value && value instanceof Array;
  }

  function isNumeric(value) {
    return value != null && !isNaN(parseFloat(value)) && isFinite(value);
  }

  function warn(text) {
    console && console.warn && console.warn(text);
  }

  function getNamespace(eventName) {
    var arr = (eventName || '').split('.');
    return {
      eventName: arr[0],
      namespace: arr[1] || null
    };
  }

  var EventEmitter = function () {
    this.events = {};
    this.guid = 0;
    this.maxListeners = EventEmitter.defaultMaxListeners;
  };

  EventEmitter.defaultMaxListeners = 10;

  EventEmitter.prototype = {
    on: function (eventName, listener, times, index) {
      var namespace = getNamespace(eventName);
      eventName = namespace.eventName;
      namespace = namespace.namespace;

      var listenerCount = this.listenerCount(eventName);
      if (listenerCount >= this.maxListeners) {
        warn('Failed to add listener: ' + (listenerCount + 1) + ' request listeners added. Use emitter.setMaxListeners() to increase limit.');
      }

      if (!isArray(this.events[eventName])) {
        this.events[eventName] = [];
      }

      var handler = {
        namespace: namespace,
        uid: ++this.guid,
        times: isNumeric(times) && times != 0 ? parseInt(times) : -1,
        listener: listener
      };
      if (isNumeric(index)) {
        this.events[eventName].splice(parseInt(index), 0, handler);
      } else {
        this.events[eventName].push(handler);
      }
      // 触发listener监听
      this.emit('newListener', eventName, listener);
      return this;
    },
    once: function (eventName, listener) {
      return this.on(eventName, listener, 1);
    },
    prependListener: function (eventName, listener) {
      return this.on(eventName, listener, -1, 0);
    },
    prependOnceListener: function (eventName, listener) {
      return this.on(eventName, listener, 1, 0);
    },
    removeListener: function (eventName, listener) {
      var namespace = getNamespace(eventName);
      eventName = namespace.eventName;
      namespace = namespace.namespace;

      var list = this.events[eventName];
      if (isArray(list)) {
        if (listener || namespace) {
          var i = list.length - 1,
            item;
          for (; i >= 0; i--) {
            item = list[i];
            if (listener === item.listener ||
              (namespace === item.namespace || namespace === 'listenerGuid' + item.uid)) {
              list.splice(i, 1);
              this.emit('removeListener', eventName, item.listener);
            }
          }
        } else {
          list = [];
        }
      }

      // 清楚空数组
      if (list && list[0]) {
        // 还存在事件
      } else {
        delete this.events[eventName];
      }
      return this;
    },
    removeAllListeners: function (eventNames) {
      if (!isArray(eventNames)) {
        eventNames = this.eventNames();
      }
      var i = 0,
        len = eventNames.length;
      for (; i < len; i++) {
        this.removeListener(eventNames[i]);
      }
    },
    emit: function (eventName) {
      var namespace = getNamespace(eventName);
      eventName = namespace.eventName;
      namespace = namespace.namespace;

      var hasListener = false;

      if (isArray(this.events[eventName])) {
        var params = [].slice.call(arguments, 1),
          list = this.events[eventName],
          item,
          i = 0,
          len = list.length;

        for (; i < len; i++) {
          item = list[i];
          if (namespace === null || namespace === item.namespace) {
            item.listener.apply(this, params);
            if (item.times === 1) {
              // 删除该事件
              this.removeListener(eventName + '.listenerGuid' + item.uid);
              // 数组被重置，调整遍历
              i--;
              len--;
            } else if (item.times > 1) {
              item.times--;
            }

            hasListener = true;
          }
        }
      }
      return hasListener;
    },
    listenerCount: function (eventName) {
      return isArray(this.events[eventName]) ?
        this.events[eventName].length :
        0;
    },
    getMaxListeners: function () {
      return this.maxListeners;
    },
    setMaxListeners: function (n) {
      if (typeof n === 'number' && n >= 0) {
        this.maxListeners = n;
      } else {
        throw new TypeError('The value of "n" is out of range. It must be a non-negative number')
      }
      return this;
    },
    // 获取所有事件名称
    eventNames: function () {
      var i,
        names = [];
      for (i in this.events) {
        if (this.events.hasOwnProperty(i)) {
          names.push(i);
        }
      }
      return names;
    },
    listeners: function (eventName) {
      var listeners = [];
      if (isArray(this.events[eventName])) {
        var list = this.events[eventName],
          i = 0,
          len = list.length;

        for (; i < len; i++) {
          listeners.push(list[i].listener);
        }
      }
      return listeners;
    }
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  return EventEmitter;
})));