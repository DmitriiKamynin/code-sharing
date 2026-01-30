import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class WorkersService {
  constructor(
    @InjectQueue('run-code-queue') private toRunQueue: Queue,
  ) {}

  async runCode(code: string, roomId: string) {
    const job = await this.toRunQueue.add('execute-code-job', { code, roomId });
    return job.id;
  }
}
