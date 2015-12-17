class Thing {
  foo () {
    trace: "foo";
    if (true) {
      trace: "bar";
      if (true) {
        trace: "qux";
        (() => {
          trace: "nested";
        })();
      }
    }
  }
}

export default function demo () {
  const thing = new Thing();
  thing.foo();
}