export default async function main() {
  const { bar } = await import('./shared.js');
  return bar;
}
