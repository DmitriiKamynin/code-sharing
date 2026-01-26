import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { unlink, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
const execAsync = promisify(exec);

const TMP_PATH = 'tmp';

@Injectable()
export class WorkersService {
  constructor() {}

  async runCode(code: string, roomId: string) {
    const fileName = `${roomId}-${new Date().getTime()}.js`;
    await writeFile(`${TMP_PATH}/${fileName}`, code);
    const result = await execAsync(`node ${TMP_PATH}/${fileName}`);
    await unlink(`${TMP_PATH}/${fileName}`);
    return result.stdout;
  }
}
