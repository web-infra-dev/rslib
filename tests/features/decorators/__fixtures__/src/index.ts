function enhancer(name: string) {
  return function enhancer(target: any) {
    target.prototype.name = name;
  };
}
@enhancer('rslib')
export class Person {
  version: string;

  constructor() {
    this.version = '1.0.0';
  }
}
