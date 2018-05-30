# Babel Plugin: Trace

This is a [Babel](https://babeljs.io/) plugin & macro which adds a straightforward, declarative syntax for adding debug logging to JavaScript applications.

[![Build Status](https://travis-ci.org/codemix/babel-plugin-trace.svg)](https://travis-ci.org/codemix/babel-plugin-trace)

## What?

It's common to insert `console.log()` statements to help keep track of the internal state of functions when writing tricky pieces of code. During development this is very useful, but it creates a lot of noise in the console, and when development of that particular piece of code is complete, the developer is likely to delete the `console.log()` calls. If we're lucky, they might leave comments in their place.

This is a tragedy - that logging information is extremely useful, not only is it helpful when fixing bugs, it's a great assistance for new developers (including yourself, 6 months from now) when getting to know a codebase.

This plugin repurposes JavaScript [LabeledStatements](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label) like `log:` and `trace:` to provide a logging / tracing syntax which can be selectively enabled or disabled at the folder, file, or function level at build time. Normally, these labels are only used as targets for labeled `break` and `continue` statements.

When disabled in production the logging statements are completely dropped out, incurring no overhead. The syntax looks like this:

```js
// login.js

async function authenticate (username, password) {
  log: 'authenticating user', username;
  const user = await db.select().from('users').where({username: username});
  if (!user) {
    log: 'no such user';
    return false;
  }
  else if (!user.checkPassword(password)) {
    log: ({ password: 'invalid' })
    return false;
  }
  else if (!user.isActive) {
    log: 'user is not active';
    return false;
  }
  log: 'logging user', username, 'into the site';
  return true;
}
```

This will produce output like:

```
login:authenticate: authenticating user Bob
login:authenticate:   no such user
login:authenticate: authenticating user Alice
login:authenticate:   invalid password
login:authenticate: authenticating user Alice
login:authenticate: logging user Alice into the site
```

As well as `log:`, you can also use `trace:` and `warn:`, or specify your own using the `aliases` plugin option. By default all `trace:` logs will be stripped (unless specifically enabled) and `warn:` will use `console.warn` rather than `console.log`.

## Installation

Install via [npm](https://npmjs.org/package/babel-plugin-trace).
```
npm install --save-dev babel-plugin-trace
```

## Plugin Configuration

In your Babel configuration, add `"trace"` to your list of plugins. The default configuration will strip all logging from production builds, as well as trace logging from development and test environment, corresponding to this configuration:
```json
{
  "plugins": [
    ["trace", {
      "strip": {
        "log": { "production": true },
        "trace": true,
        "warn": { "production": true }
      }
    }]
  ]
}
```

`"strip"` may also take a `true` value to disable all logging by default. In this case you can still enable it for certain files or functions using environment variables:
```json
{
  "plugins": [
    ["trace", { "strip": true }]
  ]
}
```

## Macro Configuration

As an alternative to use as a plugin, `babel-plugin-trace/macro` is provided for use together with [babel-plugin-macros](https://github.com/kentcdodds/babel-plugin-macros). This is relevant in particular if you're working with a [create-react-app](https://github.com/facebook/create-react-app) project, as that does not otherwise allow for Babel plugins to be used. With macro use, you'll need to import the macro in every file where you'd like to enable logging:

```js
import initTrace from 'babel-plugin-trace/macro'
initTrace()
log: 'This is', { a: 'message' }
warn: ({ this: 'a warning' }) // parentheses are required if the first value is an { object }
```

To customise the logging labels, import them as named imports of the macro (the default import is still required, as the labels don't really match the imported variable bindings):

```js
import initTrace, { log, announce } from 'babel-plugin-trace/macro'
initTrace()
announce: 'This is', { an: 'announcement' }
warn: 'This is not logged as a warning'
```

A source reference to the default export [is required](https://github.com/kentcdodds/babel-plugin-macros/pull/65) to trigger the macro; it will be removed during transpilation.

## Environment Variables

### `TRACE_LEVEL` - Enable only specific logging levels
Log only `warn` statements.
```
TRACE_LEVEL=warn babel -d ./lib ./src
```

Log `trace` and `warn` statements.
```
TRACE_LEVEL=trace,warn babel -d ./lib ./src
```

### `TRACE_FILE` - Enable by filename
Enable logging for any file with `login.js` in the path.
```
TRACE_FILE=login.js babel -d ./lib ./src
```

Enable logging for any file with `db/models` or `components/login` in the path.
```
TRACE_FILE=db/models,components/login babel -d ./lib ./src
```

### `TRACE_CONTEXT` - Enable for specific functions
Enable logging for any function called `login()` or `logout()`.
```
TRACE_CONTEXT=:login,:logout babel -d ./lib ./src
```

Enable logging for any function in a class called `User`.
```
TRACE_CONTEXT=:User: babel -d ./lib ./src
```

## License

Published by [codemix](http://codemix.com/) under a permissive MIT License, see [LICENSE.md](./LICENSE.md).

