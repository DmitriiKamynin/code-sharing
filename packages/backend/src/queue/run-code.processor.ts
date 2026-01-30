import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EventsGateway } from '../events/events.gateway';

@Processor('code-result-queue')
export class RunCodeProcessor extends WorkerHost {
  constructor(private readonly eventsGateway: EventsGateway) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case 'code-complited-job':
        await this.handleCodeCompletedJob(job);
        break;
      default:
        break;
    }
  }

  private async handleCodeCompletedJob(job: Job): Promise<void> {
    const { roomId, result } = job.data;
    await this.eventsGateway.sendExecutionResult(roomId, result ?? '');
  }
}