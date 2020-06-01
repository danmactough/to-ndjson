const test = require('tape');
const assert = require('assert');
const { PassThrough } = require('stream');

const { ToNDJSON } = require('./');

test('converts JSON array of objects to NDJSON', (t) => {
  const pass = new PassThrough({
    decodeStrings: false,
    defaultEncoding: 'utf8',
    encoding: 'utf8',
  });
  let counter = 0;
  const expected = ['{"a":1,"b":2}\n', '{"a":3,"b":4}\n'];
  pass.on('data', (data) => {
    t.strictEqual(data, expected[counter], 'line matches expected JSON value');
    counter++;
  });
  pass.on('finish', () => {
    t.strictEqual(counter, 2, 'generates 2 lines');
    t.end();
  });

  const s = new ToNDJSON();
  s.pipe(pass);
  s.end('[{"a":1,"b":2},{"a":3,"b":4}]');
});

test('converts JSON array of objects to object stream', (t) => {
  const pass = new PassThrough({ objectMode: true });
  let counter = 0;
  const expected = [
    { a: 1, b: 2 },
    { a: 3, b: 4 },
  ];
  pass.on('data', (data) => {
    t.deepEqual(data, expected[counter], 'object matches expected JSON value');
    counter++;
  });
  pass.on('finish', () => {
    t.strictEqual(counter, 2, 'generates 2 objects');
    t.end();
  });

  const s = new ToNDJSON({ readableObjectMode: true });
  s.pipe(pass);
  s.end('[{"a":1,"b":2},{"a":3,"b":4}]');
});

test('converts JSON array of objects to NDJSON in chunks', (t) => {
  const pass = new PassThrough({
    decodeStrings: false,
    defaultEncoding: 'utf8',
    encoding: 'utf8',
  });
  let counter = 0;
  const expected = ['{"a":1,"b":2}\n', '{"a":3,"b":4}\n'];
  pass.on('finish', () => {
    t.strictEqual(counter, 2, 'generates 2 objects');
    t.end();
  });

  const s = new ToNDJSON();
  s.pipe(pass);

  pass.once('data', (data) => {
    t.strictEqual(data, '{"a":1,"b":2}\n', 'line matches expected JSON value');
    counter++;
  });

  s.write('[{"a":1,"b":2},{');

  pass.once('data', (data) => {
    t.strictEqual(data, '{"a":3,"b":4}\n', 'line matches expected JSON value');
    counter++;
  });

  s.write('"a":3,"b":4}');
  s.end();
});
