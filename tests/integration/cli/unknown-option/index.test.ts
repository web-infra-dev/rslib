import { describe, expect, test } from '@rstest/core';
import { runCliSync } from 'test-helper';

describe('unknown option', () => {
  test('should exit with error code 1 when unknown options are provided', () => {
    try {
      runCliSync('build --unknown-option', {
        stdio: ['ignore', 'ignore', 'pipe'],
      });
      throw new Error('expected to throw but did not.');
    } catch (error: unknown) {
      const err = error as { status?: number; message: string };
      expect(err.status).toBe(1);
      expect(err.message).toMatch(/Unknown option `--unknownOption`/);
    }
  });
});
