/**
 * EventEmitter for browser
 * @author  Travis [godxiaoji@gmail.com]
 * @version 1.0.2
 * 
 * @see https://nodejs.org/api/events.html
 */

/*
 Supported export methods:
 * Miniprogram
 * <script> (window.EventEmitter)
 * Node.js
*/

'use strict';

/**
 * 判断输入的值是不是数组
 * @param value 
 */
function isArray(value: any): boolean {
  return value && value instanceof Array;
}

/**
 * 判断输入的值是不是数字或者数字字符串
 * @param value
 */
function isNumeric(value: any): boolean {
  return value != null && !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * 警告输出
 * @param text 
 */
function warn(text: string): void {
  console && console.warn && console.warn(text);
}

/**
 * 解析出命名空间
 * @param eventName 
 */
function splitNamespace(eventName: string): {
  eventName: string,
  namespace: any
} {
  let arr = (eventName || '').split('.');
  return {
    eventName: arr[0],
    namespace: arr[1] || null
  };
}

/**
 * 事件触发器
 */
class EventEmitter {
  static defaultMaxListeners: number = 10

  private events: {
    [propName: string]: {
      namespace: string | null,
      uid: number,
      times: number,
      listener: Function
    }[]
  };
  private guid: number;
  private maxListeners: number;

  constructor() {
    this.events = {};
    this.guid = 0;
    this.maxListeners = EventEmitter.defaultMaxListeners;
  }

  /**
   * 添加 listener 函数到名为 eventName 的事件的监听器数组的末尾
   * @param eventName
   * @param listener
   * @returns {EventEmitter}
   */
  on(eventName: string, listener: Function, times?: number, index?: number) {
    let nsObj = splitNamespace(eventName);
    eventName = nsObj.eventName;
    let namespace = nsObj.namespace;

    let lc = this.listenerCount(eventName);
    if (lc >= this.maxListeners) {
      warn('Failed to add listener: ' + (lc + 1) + ' request listeners added. Use emitter.setMaxListeners() to increase limit.');
    }

    if (!isArray(this.events[eventName])) {
      this.events[eventName] = [];
    }

    const handler = {
      namespace: namespace,
      uid: ++this.guid,
      times: isNumeric(times) && times != 0 ? parseInt((<string | number>times).toString()) : -1,
      listener: listener
    };
    if (isNumeric(index)) {
      this.events[eventName].splice(parseInt((<string | number>index).toString()), 0, handler);
    } else {
      this.events[eventName].push(handler);
    }
    // 触发listener监听
    this.emit('newListener', eventName, listener);
    return this;
  }

  addListener = this.on;

  /**
   * 添加单次监听器 listener 到名为 eventName 的事件
   * @param eventName
   * @param listener
   * @returns {EventEmitter}
   */
  once(eventName: string, listener: Function) {
    return this.on(eventName, listener, 1);
  }

  /**
   * 添加 listener 函数到名为 eventName 的事件的监听器数组的开头
   * @param eventName
   * @param listener
   * @returns {EventEmitter}
   */
  prependListener(eventName: string, listener: Function) {
    return this.on(eventName, listener, -1, 0);
  }

  /**
   * 添加单次监听器 listener 到名为 eventName 的事件的监听器数组的开头
   * @param eventName
   * @param listener
   * @returns {EventEmitter}
   */
  prependOnceListener(eventName: string, listener: Function) {
    return this.on(eventName, listener, 1, 0);
  }

  /**
   * 从名为 eventName 的事件的监听器数组中移除指定的 listener
   * @param eventName 
   * @param listener 
   * @returns {EventEmitter}
   */
  removeListener(eventName: string, listener?: Function) {
    let nsObj = splitNamespace(eventName);
    eventName = nsObj.eventName;
    let namespace = nsObj.namespace;

    let list = this.events[eventName];
    if (isArray(list)) {
      if (listener || namespace) {
        for (let i = list.length - 1; i >= 0; i--) {
          let item = list[i];
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
  }

  off = this.removeListener;

  /**
   * 移除全部监听器或指定的 eventName 事件的监听器
   * @param eventName
   * @returns {EventEmitter}
   */
  removeAllListeners(eventNames?: string[]) {
    if (!isArray(eventNames)) {
      eventNames = this.eventNames();
    }

    (<string[]>eventNames).forEach((v: string) => {
      this.removeListener(v);
    });

    return this;
  }

  /**
   * 按照监听器注册的顺序，同步地调用每个注册到名为 eventName 的事件的监听器，并传入提供的参数
   * 如果事件有监听器，则返回 true，否则返回 false
   * @param eventName
   * @param ...args
   * @returns {boolean}
   */
  emit(eventName: string, ...args: any[]) {
    let nsObj = splitNamespace(eventName);
    eventName = nsObj.eventName;
    let namespace = nsObj.namespace;

    let hasListener = false;

    if (isArray(this.events[eventName])) {
      let list = this.events[eventName],
        item;

      for (let i = 0, len = list.length; i < len; i++) {
        item = list[i];
        if (namespace === null || namespace === item.namespace) {
          item.listener.apply(this, args);
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
  }

  /**
   * 返回正在监听的名为 eventName 的事件的监听器的数量
   * @param eventName
   * @returns {number}
   */
  static listenerCount(emitter: EventEmitter, eventName: string): number {
    return isArray(emitter.events[eventName])
      ? emitter.events[eventName].length
      : 0;
  }

  /**
   * 返回正在监听的名为 eventName 的事件的监听器的数量
   * @param eventName
   * @returns {number}
   */
  listenerCount(eventName: string) {
    return EventEmitter.listenerCount(this, eventName);
  }

  /**
   * 返回 EventEmitter 当前的监听器最大限制数的值，该值可以使用 emitter.setMaxListeners(n) 设置或默认为 EventEmitter.defaultMaxListeners
   * @returns {number}
   */
  getMaxListeners() {
    return this.maxListeners;
  }

  /**
   * 为指定的 EventEmitter 实例修改限制。 值设为 Infinity（或 0）表示不限制监听器的数量
   * @param n 
   * @returns {EventEmitter}
   */
  setMaxListeners(n: number) {
    if (typeof n === 'number' && n >= 0) {
      this.maxListeners = n;
    } else {
      throw new TypeError('The value of "n" is out of range. It must be a non-negative number')
    }
    return this;
  }

  /**
   * 返回已注册监听器的事件名数组
   * @returns {string[]}
   */
  eventNames() {
    return Object.keys(this.events);
  }

  /**
   * 基于事件名获取所有监听函数
   * @param eventName 
   * @returns {Function[]}
   */
  listeners(eventName: string): Function[] {
    let listeners: any[] = [];

    if (isArray(this.events[eventName])) {
      this.events[eventName].forEach(v => {
        listeners.push(v.listener);
      });
    }

    return listeners;
  }

  /**
   * 返回 eventName 事件的监听器数组的拷贝，包括封装的监听器（例如由 .once() 创建的）
   * 使用eval拷贝的函数
   * @param eventName 
   * @returns {Function[]}
   */
  rawListeners(eventName: string) {
    return this.listeners(eventName).map(v => {
      return <Function>eval('(' + v.toString() + ')')
    })
  }
}

declare const window: Window & { EventEmitter: any }

if (typeof (<any>window) !== 'undefined') {
  window.EventEmitter = EventEmitter;
}

export default EventEmitter;