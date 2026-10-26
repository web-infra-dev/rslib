import { beforeEach, describe, expect, it, rs } from '@rstest/core';
import type { WatchStatusReporter } from 'typescript6-api';
import { emitDtsWithOldApi } from '../src/apiOld';

const mocks = rs.hoisted(() => ({
  reportStatus: undefined as WatchStatusReporter | undefined,
  processDtsFiles: rs.fn(),
  error: rs.fn(),
}));

rs.mock('@rsbuild/core', () => ({
  logger: { info: rs.fn(), error: mocks.error },
}));

rs.mock('../src/utils', () => ({
  color: { dim: (value: string) => value },
  getTimeCost: rs.fn(),
  renameDtsFile: rs.fn(),
  updateDeclarationMapContent: rs.fn(),
  processDtsFiles: mocks.processDtsFiles,
  loadTypescript: () => ({
    sys: { getCurrentDirectory: () => '/project', newLine: '\n' },
    flattenDiagnosticMessageText: (message: string) => message,
    createWatchCompilerHost: (...args: unknown[]) => {
      mocks.reportStatus = args[5] as WatchStatusReporter;
      return {};
    },
    createWatchProgram: () => {},
  }),
}));

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

const options = {
  configPath: '/project/tsconfig.json',
  tsConfigResult: { options: {}, fileNames: [], errors: [] },
  declarationDir: '/project/dist',
  name: 'esm',
  dtsExtension: '.d.ts',
  rootDir: '/project/src',
  cwd: '/project',
  paths: {},
  redirect: {},
};

function reportSuccess() {
  mocks.reportStatus!(
    { code: 6194, messageText: 'Found 0 errors', category: 3 },
    '\n',
    {},
    0,
  );
}

describe('tsc watch completion', () => {
  beforeEach(() => {
    mocks.processDtsFiles.mockReset();
    mocks.error.mockReset();
  });

  it('waits for post-processing and declaration bundling before resolving', async () => {
    const postprocess = deferred();
    const bundle = deferred();
    mocks.processDtsFiles.mockReturnValue(postprocess.promise);
    const onComplete = rs.fn(() => bundle.promise);
    let completed = false;
    const task = emitDtsWithOldApi(options, onComplete, true, true).then(() => {
      completed = true;
    });

    reportSuccess();
    await Promise.resolve();
    expect(mocks.processDtsFiles).toHaveBeenCalledTimes(1);
    expect(onComplete).not.toHaveBeenCalled();
    expect(completed).toBe(false);

    postprocess.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(onComplete).toHaveBeenCalledWith(true);
    expect(completed).toBe(false);

    bundle.resolve();
    await task;
    expect(completed).toBe(true);
  });

  it('reports an initial post-processing failure to the parent task', async () => {
    const error = new Error('declaration processing failed');
    mocks.processDtsFiles.mockRejectedValue(error);
    const task = emitDtsWithOldApi(options, rs.fn(), false, true);
    reportSuccess();
    await expect(task).rejects.toThrow('declaration processing failed');
  });

  it('reports an initial bundling failure to the parent task', async () => {
    const task = emitDtsWithOldApi(
      options,
      async () => {
        throw new Error('declaration bundling failed');
      },
      true,
      true,
    );
    reportSuccess();
    await expect(task).rejects.toThrow('declaration bundling failed');
  });
});
