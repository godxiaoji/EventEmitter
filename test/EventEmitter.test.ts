import EventEmitter from "../src/EventEmitter";
// import { EventEmitter } from "events";
import 'mocha';
import { expect } from "chai";

describe('listeners响应测试', function () {
  it('用例1', function (done) {
    let isRight = false;

    let emitter = new EventEmitter()

    emitter.on('handle', () => {
      isRight = true;

      expect(isRight).to.be.equal(true);

      done();
    })

    emitter.emit('handle');

  })
})