export class Foo {
  constructor() {
    this.#bar();
  }

  #bar() {}
}

export function foo(options: unknown = {}): void {
  console.log(options);
}
