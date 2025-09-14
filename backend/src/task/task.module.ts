import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { ElasticsearchModule } from '@/modules/elasticsearch/elasticsearch.module';

@Module({
  imports: [ElasticsearchModule],
  providers: [TaskService]
})
export class TaskModule {}
