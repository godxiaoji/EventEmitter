import EventEmitter from "../src/EventEmitter";
// import { EventEmitter } from "events";
import 'mocha';
import { expect } from "chai";

describe('listeners响应测试', function () {
  it('传参测试:...args', function (done) {
    let emitter = new EventEmitter()

    emitter.on('test1', (arg1: any, arg2: any) => {
      expect(arg1).to.be.equals('arg1');
      expect(arg2).to.be.equals('arg2');

      done();
    });

    emitter.emit('test1', 'arg1', 'arg2');

  })

  it('多个监听器顺序测试:on', function (done) {
    let emitter = new EventEmitter(),
      index = 0;

    emitter.on('test', () => {
      expect(index).to.be.equals(0);

      index++;

      if (index > 2) {
        done();
      }
    });

    emitter.on('test', () => {
      expect(index).to.be.equals(1);

      index++;

      if (index > 2) {
        done();
      }
    });

    emitter.emit('test');

  })

  it('多个监听器顺序测试:prependListener', function (done) {
    let emitter = new EventEmitter(),
      index = 0;

    emitter.on('test', () => {
      expect(index).to.be.equals(1);

      index++;

      if (index > 1) {
        done();
      }
    });

    emitter.prependListener('test', () => {
      expect(index).to.be.equals(0);

      index++;

      if (index > 1) {
        done();
      }
    });

    emitter.emit('test');
  })

  it('监听一次测试:once', function (done) {
    let emitter = new EventEmitter(),
      index = 0;

    emitter.once('test', () => {
      index++;
    });

    emitter.emit('test');
    emitter.emit('test');
    emitter.emit('test');

    setTimeout(() => {
      expect(index).to.be.equals(1);

      done();
    }, 0);

  })
})