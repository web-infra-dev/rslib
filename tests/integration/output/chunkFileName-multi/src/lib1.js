export default async function main() {
  const { foo } = await import('./shared.js');
  return foo;
}
