class Thing {
  foo () {
    log: "foo";
    if (true) {
      log: "bar";
      if (true) {
        log: "qux";
        (() => {
          warn: "nested";
        })();
      }
    }
  }
}

export default function demo () {
  const thing = new Thing();
  thing.foo();
}
