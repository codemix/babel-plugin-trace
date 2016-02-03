import fs from 'fs';
import {parse, transform, traverse} from 'babel-core';

if (process.env.NODE_WATCH) {
  var Trace = require('../src').default;
}
else if (process.env.TRACE_USE_LIBCHECKED) {
  var Trace = require('../lib-checked').default;
}
else {
  var Trace = require('../lib').default;
}

describe('Trace', function () {
  ok('simple', 123);
  ok('multiple', 123);
  ok('if-statement', 123);
  ok('classes', 123);
  ok('sequence', 123);
});

function load (basename) {
  return loadInternal(basename).exports.default;
}

function loadInternal (basename) {
  const filename = `${__dirname}/fixtures/${basename}.js`;
  const source = fs.readFileSync(filename, 'utf8');
  const transformed = transform(source, {
    filename: filename,
    presets: [
      "es2015",
      "stage-0",
    ],
    plugins: [
      [Trace, {
        aliases2: {
          trace: 'console.log(indent ? (new Array(indent + 1)).join("  ") : `${basename}#${parentName}`, message)',
          warn: 'console.warn(parentName, message)'
        }
      }],
      'transform-flow-strip-types',
      'syntax-class-properties'
    ]
  });
  const context = {
    exports: {}
  };
  if (process.env.TRACE_SAVE_TRANSFORMED) {
    fs.writeFileSync(`${__dirname}/fixtures/${basename}.js.transformed`, transformed.code, 'utf8');
  }
  const loaded = new Function('module', 'exports', 'require', transformed.code);
  loaded(context, context.exports, (path) => {
    if (/^\.\//.test(path)) {
      const module = loadInternal(path.slice(2));
      return module.exports;
    }
    else {
      return require(path);
    }
  });
  return context;
}

function isThenable (thing: mixed): boolean {
  return thing && typeof thing.then === 'function';
}


function ok (basename, ...args) {
  it(`should load '${basename}'`, async function () {
    const result = load(basename)(...args);
    if (isThenable(result)) {
      await result;
    }
  });
}

function fail (basename, ...args) {
  it(`should not load '${basename}'`, async function () {
    let failed = false;
    try {
      const result = load(basename)(...args);
      if (isThenable(result)) {
        await result;
      }
    }
    catch (e) {
      failed = true;
    }
    if (!failed) {
      throw new Error(`Test '${basename}' should have failed but did not.`);
    }
  });
}

function failWith (errorMessage, basename, ...args) {
  it(`should not load '${basename}'`, async function () {
    let failed = false;
    let message;
    try {
      const result = load(basename)(...args);
      if (isThenable(result)) {
        await result;
      }
    }
    catch (e) {
      failed = true;
      message = e.message;
    }
    if (!failed) {
      throw new Error(`Test '${basename}' should have failed but did not.`);
    }
    // ignore differences in whitespace in comparison.
    if (message.replace(/\s+/g, ' ') !== errorMessage.replace(/\s+/g, ' ')) {
      throw new Error(`Test '${basename}' failed with ${message} instead of ${errorMessage}.`);
    }
  });
}


function failStatic (basename, ...args) {
  it(`should refuse to load '${basename}'`, function () {
    let failed = false;
    try {
      load(basename)(...args);
    }
    catch (e) {
      if (e instanceof SyntaxError) {
        failed = true;
        //console.log(e.toString());
      }
      else {
        throw e;
      }
    }
    if (!failed) {
      throw new Error(`Test '${basename}' should have failed static verification but did not.`);
    }
  });
}