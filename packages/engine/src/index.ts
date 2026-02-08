import { Worker, Queue } from 'bullmq';
import { exec } from 'node:child_process';
import { unlink, writeFile } from 'node:fs/promises';
import fs from 'node:fs';
import { promisify } from 'node:util';
import { config } from 'dotenv';
import path from 'node:path';

config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = +(process.env.REDIS_PORT || 6379);

const execAsync = promisify(exec);

const TMP_PATH = path.resolve('tmp');

if (!fs.existsSync(TMP_PATH)) {
  fs.mkdirSync(TMP_PATH);
}

const resultQueue = new Queue('code-result-queue', {
  connection: { host: REDIS_HOST, port: REDIS_PORT },
});

new Worker('run-code-queue', async (job) => {
    console.log('[WorkerGetJob] Name:', job.name);

    const { code, roomId } = job.data;

    const fileName = `${roomId}-${new Date().getTime()}.js`;
    const filePath = path.join(TMP_PATH, fileName);

    try {
      await writeFile(filePath, code);
      const result = await execAsync(`node ${filePath}`);
      await resultQueue.add('code-complited-job', { roomId, result: result.stdout });
      console.log('[WorkerSuccess]');
    } catch (error: any) {
      console.error('[WorkerError] Error:', error);
      await resultQueue.add('code-complited-job', { roomId, result: error.stderr });
    } finally {
      await unlink(filePath)
        .catch((error) => console.error('[WorkerError] File deletion error:', error));
    }
}, {
  connection: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});