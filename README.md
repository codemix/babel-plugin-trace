# Babel Contracts

This is a [Babel](https://babeljs.io/) plugin which adds a straightforward, declarative syntax for adding logging to JavaScript applications.

[![Build Status](https://travis-ci.org/codemix/babel-plugin-trace.svg)](https://travis-ci.org/codemix/babel-plugin-trace)

# What?

Turns code like this:

```js
async function login (username, password) {
  trace: `Logging in user: ${username}.`;
  const user = await User.select().where({username});
  if (!user) {
    trace: 'No such user.';
    return false;
  }
  else if (!user.isActive) {
    trace: 'User is inactive.';
    return false;
  }
  else if (!user.verifyPassword(password)) {
    trace: 'Invalid password.';
    return false;
  }

  if (user.hasInsecurePassword) {
    warn: 'User needs to upgrade their password.';
  }

  const token = await createSession(user);
  if (!token) {
    trace: 'Could not create session.';
    return false;
  }

  trace: "User logged in";

  return [user, token];
}
```

Into code like this:

async function login (username, password) {
  console.log("trace:login(): " + `Logging in user: ${username}.`);
  const user = await User.select().where({username});
  if (!user) {
    console.log('\t|- No such user.');
    return false;
  }
  else if (!user.isActive) {
    console.log('\t|- User is inactive.');
    return false;
  }
  else if (!user.verifyPassword(password)) {
    console.log('\t|- Invalid password.');
    return false;
  }

  if (user.hasInsecurePassword) {
    console.warn('\t|- User needs to upgrade their password.');
  }

  const token = createSession(user);
  if (!token) {
    console.log('\t|- Could not create session.');
    return false;
  }

  return [user, token];
}


# Installation

Install via [npm](https://npmjs.org/package/babel-plugin-trace).
```sh
npm install --save-dev babel-plugin-trace
```
Then, in your babel configuration (usually in your `.babelrc` file), add `"trace"` to your list of plugins:
```json
{
  "plugins": ["trace", {
    "env": {
      "production": {
        "strip": true
      }
    }
  }]
}
```

The above example configuration will remove all tracing when `NODE_ENV=production`, which is often preferable for performance reasons.

## Examples

# License

Published by [codemix](http://codemix.com/) under a permissive MIT License, see [LICENSE.md](./LICENSE.md).

