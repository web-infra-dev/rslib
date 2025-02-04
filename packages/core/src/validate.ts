import color from 'picocolors';
import * as typia from 'typia';
import type { RslibConfig } from './types';

export const validateConfig: (
  input: unknown,
) => typia.IValidation<RslibConfig> = typia.createValidateEquals<RslibConfig>();

export function validate(input: unknown, configPath?: string): RslibConfig {
  const result = validateConfig(input);

  if (result.success) {
    return result.data;
  }

  const messages = result.errors.flatMap(({ expected, path, value }) => {
    if (expected === 'undefined') {
      // Unknown properties
      return [`Unknown property: \`${color.red(path)}\` in configuration`, ''];
    }

    return [
      `Invalid config on \`${color.red(path)}\`.`,
      `  - Expect to be ${color.green(expected)}`,
      `  - Got: ${color.red(whatIs(value))}`,
      '',
    ];
  });

  // We use `Array.isArray` outside to deal with error messages
  throw new Error(
    [
      `Invalid configuration${
        configPath ? ` loaded from ${color.dim(configPath)}` : '.'
      }`,
      '',
    ]
      .concat(messages)
      .join('\n'),
  );
}

function whatIs(value: unknown): string {
  return Object.prototype.toString
    .call(value)
    .replace(/^\[object\s+([a-z]+)\]$/i, '$1')
    .toLowerCase();
}
