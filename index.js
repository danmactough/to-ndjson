const Parser = require('jsonparse');
const { Transform } = require('stream');
const { EOL } = require('os');

class ToNDJSON extends Transform {
  constructor(options = {}) {
    super(options);
    const stream = this;
    const parser = (this._parser = new Parser());
    parser.onValue = function (value) {
      if (this.stack.length === 1) {
        value =
          options.readableObjectMode === true
            ? value
            : JSON.stringify(value) + EOL;
        stream.push(value);
      }
    };
    parser.onError = function (error) {
      stream.destroy(error);
    };
  }

  _transform(chunk, encoding, callback) {
    this._parser.write(chunk);
    callback();
  }
}

module.exports = { ToNDJSON };
