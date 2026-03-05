/**
 * Parse template input string and return the full template name with language suffix.
 * If the input already ends with a valid language suffix (ts/js), use it as-is.
 * Otherwise, append '-ts' as the default language.
 */
export function parseTemplateName(template: string): string {
  const pair = template.split('-');
  const lastPart = pair[pair.length - 1];

  // Check if the last part is a valid language suffix.
  if (lastPart === 'ts' || lastPart === 'js') {
    const rest = pair.slice(0, pair.length - 1).join('-');

    // Handle edge case where input is just "ts" or "js".
    if (!rest) {
      throw new Error(
        `Invalid template name: "${template}". Template name cannot be just a language suffix.`,
      );
    }

    return `${rest}-${lastPart}`;
  }

  // No language suffix provided, default to 'ts'.
  return `${template}-ts`;
}
