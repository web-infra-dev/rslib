import { describe, expect, test } from '@rstest/core';
import { runCliSync } from 'test-helper';

describe('unknown option', () => {
  test('should exit with error code 1 when unknown options are provided', () => {
    const { stderr, status } = runCliSync('build --unknown-option', {
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    expect(status).toBe(1);
    expect(stderr).toMatch(/Unknown option `--unknownOption`/);
  });
});
