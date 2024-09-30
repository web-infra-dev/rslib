const i1 = import(`${process.env.DIR}./other`);
const i2 = import(process.env.DIR!);
const condition = 1 > 0;
const i3 = import(condition ? './other1' : './other2');
export { i1, i2, i3 };
