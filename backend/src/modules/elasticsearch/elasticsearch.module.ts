import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchService, ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch';

@Module({
  imports: [
    ConfigModule,
    NestElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_URL'),
      }),
    }),
  ],
})
export class ElasticsearchModule implements OnModuleInit {
  constructor(
    private readonly es: ElasticsearchService
  ) { }

  async onModuleInit() {
    const exitsts = await this.es.indices.exists({ index: 'products' })
    if (!exitsts) {
      await this.es.indices.create({
        index: 'products',
        settings: {
          index: {
            number_of_replicas: 2,// many copies of data
            number_of_shards: 3,// many pieces the data id splited,
            analysis: {
              analyzer: {
                custom_vn_analyzer: {
                  type: 'custom',
                  tokenizer: 'standard',
                  filter: ['lowercase', 'asciifolding'],
                },
              }
            }
          }
        },
        mappings: {
          properties: {
            id: { type: 'text' },
            name: { type: 'text' },
            slug: { type: 'text' },
            
          }
        }
      })
    }


  }
}
