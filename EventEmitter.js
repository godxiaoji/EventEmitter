(function() {
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

    var EventEmitter = function() {
        this.events = {};
        this.guid = 0;
        this.maxListeners = EventEmitter.defaultMaxListeners;
    };

    EventEmitter.defaultMaxListeners = 10;

    EventEmitter.prototype = {
        on: function(eventName, listener, times, index) {
            var listenerCount = this.listenerCount(eventName);
            if (listenerCount >= this.maxListeners) {
                warn('Failed to add listener: ' + (listenerCount + 1) + ' request listeners added. Use emitter.setMaxListeners() to increase limit.');
            }
            if (!isArray(this.events[eventName])) {
                this.events[eventName] = [];
            }
            var handler = {
                uid: ++this.guid,
                times: isNumeric(times) && times != 0 ? parseInt(times) : -1,
                listener: listener
            };
            if (isNumeric(index)) {
                this.events[eventName].splice(parseInt(index), 0, handler);
            } else {
                this.events[eventName].push(handler);
            }
            this.emit('newListener');
            return this;
        },
        once: function(eventName, listener) {
            return this.on(eventName, listener, 1);
        },
        prependListener: function(eventName, listener) {
            return this.on(eventName, listener, -1, 0);
        },
        prependOnceListener: function(eventName, listener) {
            return this.on(eventName, listener, 1, 0);
        },
        removeListener: function(eventName, listener, uid) {
            var list = this.events[eventName];
            if (isArray(list)) {
                if (listener || uid) {
                    var i = list.length - 1;
                    for (; i >= 0; i--) {
                        item = list[i];
                        if (item.listener === listener || item.uid === uid) {
                            list.splice(i, 1);
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
        removeAllListeners: function(eventNames) {
            if (!isArray(eventNames)) {
                eventNames = this.eventNames();
            }
            var i = 0,
                len = eventNames.length;
            for (; i < len; i++) {
                this.removeListener(eventNames[i]);
            }
        },
        emit: function(eventName) {
            if (isArray(this.events[eventName])) {
                var params = [].slice.call(arguments, 1),
                    list = this.events[eventName],
                    item,
                    i = 0,
                    len = list.length;

                for (; i < len; i++) {
                    item = list[i];
                    item.listener.apply(this, params);
                    if (item.times === 1) {
                        // 删除该事件
                        this.removeListener(eventName, null, item.uid);
                    } else if (item.times > 1) {
                        item.times--;
                    }
                }
            }
            return this;
        },
        listenerCount: function(eventName) {
            return isArray(this.events[eventName]) ?
                this.events[eventName].length :
                0;
        },
        getMaxListeners: function() {
            return this.maxListeners;
        },
        setMaxListeners: function(n) {
            if (isNumeric(n)) {
                this.maxListeners = parseInt(n);
            }
            return this;
        },
        // 获取所有事件名称
        eventNames: function() {
            var i,
                names = [];
            for (i in this.events) {
                if (this.events.hasOwnProperty(i)) {
                    names.push(i);
                }
            }
            return names;
        },
        listeners: function(eventName) {
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

    window.EventEmitter = EventEmitter;
})();