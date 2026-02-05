import { Worker, Queue } from 'bullmq';
import { exec } from 'node:child_process';
import { unlink, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { config } from 'dotenv';

config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = +(process.env.REDIS_PORT || 6379);

const execAsync = promisify(exec);

const TMP_PATH = 'tmp';

const resultQueue = new Queue('code-result-queue', {
  connection: { host: REDIS_HOST, port: REDIS_PORT },
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
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});