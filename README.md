# to-ndjson

Convert a JSON array of objects to line-delimited JSON **without parsing the entire array into memory**.

If you need to parse very large JSON that is unfortunately formatted as an array of objects, this is your jam.

## Usage

All options of [Readable](https://nodejs.org/api/stream.html#stream_new_stream_readable_options) and [Writable](https://nodejs.org/api/stream.html#stream_constructor_new_stream_writable_options) streams can be passed to the `ToNDJSON` constructor, but the most relevant option is `readableObjectMode`. If you set `readableObjectMode: true`, your consumer will receive a stream of JSON objects. Otherwise, the default behavior is that your consumer will receive a stream of JSON stringified objects, each followed by a newline.

```js
const { ToNDJSON } = require('to-ndjson');
const { pipeline } = require('stream');
const fs = require('fs');
const { EOL } = require('os');

pipeline(
  fs.createReadStream(someHugeJsonArray),
  new ToNDJSON({ readableObjectMode: true }),
  async function* filter(lines) {
    for await (const line of lines) {
      if (line.property.match(/some test/)) {
        yield JSON.stringify(line) + EOL;
      }
    }
  },
  fs.createWriteStream(someOutputFile),
  (err) => {
    if (err) {
      console.error(err);
    } else {
      console.error('Done');
    }
  }
);
```

## Prior art

This module depends on [creationix/jsonparse](https://github.com/creationix/jsonparse) by Tim Caswell and was inspired by [dominictarr/JSONStream](https://github.com/dominictarr/JSONStream). In fact, the only reason to use this module instead of JSONStream (which can do the same thing and more) is to get compatibility and interoperability with the current Node streams ecosystem, such as [stream.pipeline](https://nodejs.org/api/stream.html#stream_stream_pipeline_source_transforms_destination_callback).

## License

[(The MIT License)](./LICENSE)
