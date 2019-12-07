const path = require('path');

module.exports = {
  entry: './src/EventEmitter.ts',
  module: {
    rules: [{
      test: /\.ts$/,
      use: "ts-loader"
    }]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'event-emitter.js'
  },
  mode: 'production'
};