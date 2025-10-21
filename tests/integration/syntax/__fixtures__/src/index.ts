export class Foo {
  constructor() {
    this.#bar();
  }

  #bar() {}
}

export function foo(options: unknown = {}): void {
  const a = {};
  const b = { ...a, b: 1 };
  console.log(options, b);
}
