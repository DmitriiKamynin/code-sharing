import { Worker, Queue } from 'bullmq';
import { exec } from 'node:child_process';
import { unlink, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const TMP_PATH = 'tmp';

const resultQueue = new Queue('code-result-queue', {
  connection: { host: 'localhost', port: 6379 },
});

new Worker('run-code-queue', async (job) => {
    const { code, roomId } = job.data;
    const fileName = `${roomId}-${new Date().getTime()}.js`;
    await writeFile(`${TMP_PATH}/${fileName}`, code);
    try {
      const result = await execAsync(`node ${TMP_PATH}/${fileName}`);
      await resultQueue.add('code-complited-job', { roomId, result: result.stdout });
    } catch (error: any) {
      console.error(error);
      await resultQueue.add('code-complited-job', { roomId, result: error.stderr });
    } finally {
      await unlink(`${TMP_PATH}/${fileName}`);
    }
}, {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});