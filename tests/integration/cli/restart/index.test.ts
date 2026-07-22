import path from 'node:path';
import { onTestFinished, test } from '@rstest/core';
import fse from 'fs-extra';
import { expectLog, runCli } from 'test-helper';

test('dev.watchFiles with restart type should restart build --watch', async () => {
  const restartFile = path.join(__dirname, 'test-temp-restart.txt');
  const distPath = path.join(__dirname, 'dist');
  fse.removeSync(distPath);
  fse.outputFileSync(restartFile, '0');

  const { child } = runCli('build --watch', {
    cwd: __dirname,
  });

  onTestFinished(() => {
    child.kill();
    fse.removeSync(restartFile);
    fse.removeSync(distPath);
  });

  await expectLog(child, 'build completed, watching for changes');

  const restarted = Promise.all([
    expectLog(child, 'onRestart'),
    expectLog(child, 'restarting build as test-temp-restart.txt changed'),
    expectLog(child, 'build completed, watching for changes'),
  ]);
  fse.outputFileSync(restartFile, '1');
  await restarted;
});
