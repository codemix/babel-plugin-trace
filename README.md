# Babel Plugin: Trace

This is a [Babel](https://babeljs.io/) plugin which adds a straightforward, declarative syntax for adding debug logging to JavaScript applications.

[![Build Status](https://travis-ci.org/codemix/babel-plugin-trace.svg)](https://travis-ci.org/codemix/babel-plugin-trace)

# What?

It's common to insert `console.log()` statements to help keep track of the internal state of functions when writing tricky pieces of code. During development this is very useful, but it creates a lot of noise in the console, and when development of that particular piece of code is complete, the developer is likely to delete the `console.log()` calls. If we're lucky, they might leave comments in their place.

This is a tragedy - that logging information is extremely useful, not only is it helpful when fixing bugs, it's a great assistance for new developers (including yourself, 6 months from now) when getting to know a codebase.

This plugin repurposes JavaScript LabeledStatements like `log:` and `trace:` to provide a logging / tracing syntax which can be selectively enabled or disabled at the folder, file, or function level at build time. Normally, these labels are only used as targets for labeled `break` and `continue` statements.

When disabled in production the logging statements are completely dropped out, incurring no overhead. The syntax looks like this:

```js
// login.js

async function authenticate (username, password) {
  trace: 'authenticating user', username;
  const user = await db.select().from('users').where({username: username});
  if (!user) {
    trace: 'no such user';
    return false;
  }
  else if (!user.checkPassword(password)) {
    trace: 'invalid password';
    return false;
  }
  else if (!user.isActive) {
    trace: 'user is not active';
    return false;
  }
  trace: 'logging user', username, 'into the site';
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

As well as `trace:`, you can also use `log:` and `warn:`, or specify your own using the `aliases` plugin option.


# Installation & Configuration

Install via [npm](https://npmjs.org/package/babel-plugin-trace).
```sh
npm install --save-dev babel-plugin-trace
```
Then, in your babel configuration (usually in your `.babelrc` file), add `"trace"` to your list of plugins:
```json
{
  "plugins": [
    ["trace", {
      "env": {
        "production": { "strip": true }
      }
    }]
  ]
}
```

The above example configuration will remove all tracing when `NODE_ENV=production`.

Alternatively, you may wish to disable all tracing by default, enabling it only for certain files or functions using environment variables:
```json
{
  "plugins": [
    ["trace", { "strip": true }]
  ]
}
```


# Environment Variables

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


# License

Published by [codemix](http://codemix.com/) under a permissive MIT License, see [LICENSE.md](./LICENSE.md).

