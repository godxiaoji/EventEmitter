# wx-event-emitter

EventEmitter for browser, Miniprogram(weapp/wxapp).

## Install

To use this module directly (without browserify), install it:

```bash
npm install wx-event-emitter
```

With [npm](https://npmjs.org) Or [Miniprogram](https://developers.weixin.qq.com/miniprogram/dev/index.html) do:

`const EventEmitter = require('wx-event-emitter');`

For use in web browsers do:

`<script src="dist/event-emitter.js"></script>`

### Add Namespace

    emitter.on('click.a');

### Documentation

The API in line with Nodejs.
[Nodejs](https://nodejs.org/api/events.html)