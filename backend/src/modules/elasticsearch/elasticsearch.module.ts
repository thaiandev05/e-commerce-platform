import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchService, ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch';
import { ElasticsearchServiceCustom } from './elasticsearch.service';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    NestElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get<string>('ELASTICSEARCH_URL'),
      }),
    }),
  ],
  providers: [ElasticsearchServiceCustom],
  exports: [ElasticsearchServiceCustom]
})
export class ElasticsearchModule implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchModule.name);

  constructor(
    private readonly es: ElasticsearchService
  ) { }

  async onModuleInit() {
    try {
      await this.createIndices();
      this.logger.log('All Elasticsearch indices created successfully');
    } catch (error) {
      this.logger.error('Error creating Elasticsearch indices:', error);
      throw error;
    }
  }

  private async createIndices(): Promise<void> {
    await Promise.all([
      this.createCategoriesIndex(),
      this.createBrandsIndex(),
      this.createSpusIndex(),
      this.createSkusIndex(),
      this.createAttributesIndex(),
      this.createTagsIndex(),
    ]);
  }

  private getCommonAnalyzers() {
    return {
      analyzer: {
        custom_vn_analyzer: {
          type: "custom" as const,
          tokenizer: "standard",
          filter: ["lowercase", "asciifolding"],
        },
        search_analyzer: {
          type: "custom" as const,
          tokenizer: "keyword",
          filter: ["lowercase", "trim"],
        },
        autocomplete_analyzer: {
          type: "custom" as const,
          tokenizer: "standard",
          filter: ["lowercase", "asciifolding", "edge_ngram_filter"],
        },
      },
      filter: {
        edge_ngram_filter: {
          type: "edge_ngram" as const,
          min_gram: 2,
          max_gram: 20,
        },
      },
    };
  }

  private getCommonSettings() {
    return {
      number_of_replicas: 1,
      number_of_shards: 2,
      analysis: this.getCommonAnalyzers(),
    };
  }

  private async createCategoriesIndex(): Promise<void> {
    const exists = await this.es.indices.exists({ index: 'categories' });
    if (!exists) {
      await this.es.indices.create({
        index: 'categories',
        settings: this.getCommonSettings(),
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: {
              type: 'text',
              analyzer: 'custom_vn_analyzer',
              fields: {
                keyword: { type: 'keyword' },
                autocomplete: { type: 'text', analyzer: 'autocomplete_analyzer' },
              },
            },
            slug: { type: 'keyword' },
            description: { type: 'text', analyzer: 'custom_vn_analyzer' },
            imageUrl: { type: 'keyword', index: false },
            isActive: { type: 'boolean' },
            sortOrder: { type: 'integer' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
            parentId: { type: 'keyword' },
            parentName: { type: 'text', analyzer: 'custom_vn_analyzer' },
            level: { type: 'integer' },
            path: { type: 'text' }, // Full category path for hierarchical search
            childrenCount: { type: 'integer' },
          },
        },
      });
    }
  }

  private async createBrandsIndex(): Promise<void> {
    const exists = await this.es.indices.exists({ index: 'brands' });
    if (!exists) {
      await this.es.indices.create({
        index: 'brands',
        settings: this.getCommonSettings(),
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: {
              type: 'text',
              analyzer: 'custom_vn_analyzer',
              fields: {
                keyword: { type: 'keyword' },
                autocomplete: { type: 'text', analyzer: 'autocomplete_analyzer' },
              },
            },
            slug: { type: 'keyword' },
            description: { type: 'text', analyzer: 'custom_vn_analyzer' },
            logoUrl: { type: 'keyword', index: false },
            websiteUrl: { type: 'keyword', index: false },
            isActive: { type: 'boolean' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
            productsCount: { type: 'integer' },
          },
        },
      });
    }
  }

  private async createSpusIndex(): Promise<void> {
    const exists = await this.es.indices.exists({ index: 'spus' });
    if (!exists) {
      await this.es.indices.create({
        index: 'spus',
        settings: this.getCommonSettings(),
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: {
              type: 'text',
              analyzer: 'custom_vn_analyzer',
              fields: {
                keyword: { type: 'keyword' },
                autocomplete: { type: 'text', analyzer: 'autocomplete_analyzer' },
              },
            },
            slug: { type: 'keyword' },
            description: { type: 'text', analyzer: 'custom_vn_analyzer' },
            shortDesc: { type: 'text', analyzer: 'custom_vn_analyzer' },
            status: { type: 'keyword' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },

            // Relations
            categoryId: { type: 'keyword' },
            categoryName: { type: 'text', analyzer: 'custom_vn_analyzer' },
            categoryPath: { type: 'text' },
            brandId: { type: 'keyword' },
            brandName: { type: 'text', analyzer: 'custom_vn_analyzer' },
            shopId: { type: 'keyword' },
            shopName: { type: 'text', analyzer: 'custom_vn_analyzer' },

            // Images
            images: {
              type: 'nested',
              properties: {
                imageUrl: { type: 'keyword', index: false },
                altText: { type: 'text', analyzer: 'custom_vn_analyzer' },
                isMain: { type: 'boolean' },
                sortOrder: { type: 'integer' },
              },
            },

            // Attributes
            attributes: {
              type: 'nested',
              properties: {
                attributeId: { type: 'keyword' },
                attributeName: { type: 'keyword' },
                attributeDisplayName: { type: 'text', analyzer: 'custom_vn_analyzer' },
                value: { type: 'text', analyzer: 'custom_vn_analyzer' },
                displayName: { type: 'text', analyzer: 'custom_vn_analyzer' },
                colorCode: { type: 'keyword' },
              },
            },

            // Tags
            tags: {
              type: 'nested',
              properties: {
                id: { type: 'keyword' },
                name: { type: 'keyword' },
                slug: { type: 'keyword' },
                color: { type: 'keyword' },
              },
            },

            // Variations
            variations: {
              type: 'nested',
              properties: {
                attributeId: { type: 'keyword' },
                attributeName: { type: 'keyword' },
                values: { type: 'text', analyzer: 'custom_vn_analyzer' },
              },
            },

            // Price range from SKUs
            minPrice: { type: 'double' },
            maxPrice: { type: 'double' },
            minSalePrice: { type: 'double' },
            maxSalePrice: { type: 'double' },

            // Stock information
            totalStock: { type: 'integer' },
            hasStock: { type: 'boolean' },
            skuCount: { type: 'integer' },
            activeSkuCount: { type: 'integer' },

            // Search boost fields
            popularity: { type: 'float' },
            searchKeywords: { type: 'text', analyzer: 'custom_vn_analyzer' },
          },
        },
      });
    }
  }

  private async createSkusIndex(): Promise<void> {
    const exists = await this.es.indices.exists({ index: 'skus' });
    if (!exists) {
      await this.es.indices.create({
        index: 'skus',
        settings: this.getCommonSettings(),
        mappings: {
          properties: {
            id: { type: 'keyword' },
            skuCode: { type: 'keyword' },
            name: {
              type: 'text',
              analyzer: 'custom_vn_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            originalPrice: { type: 'double' },
            salePrice: { type: 'double' },
            finalPrice: { type: 'double' }, // Computed field: salePrice or originalPrice
            discountPercentage: { type: 'float' },
            stock: { type: 'integer' },
            weight: { type: 'double' },
            dimensions: {
              properties: {
                length: { type: 'double' },
                width: { type: 'double' },
                height: { type: 'double' },
                volume: { type: 'double' },
              },
            },
            status: { type: 'keyword' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },

            // SPU relation
            spuId: { type: 'keyword' },
            spuName: { type: 'text', analyzer: 'custom_vn_analyzer' },
            spuSlug: { type: 'keyword' },

            // Category and Brand (from SPU)
            categoryId: { type: 'keyword' },
            categoryName: { type: 'text', analyzer: 'custom_vn_analyzer' },
            brandId: { type: 'keyword' },
            brandName: { type: 'text', analyzer: 'custom_vn_analyzer' },
            shopId: { type: 'keyword' },

            // Images
            images: {
              type: 'nested',
              properties: {
                imageUrl: { type: 'keyword', index: false },
                altText: { type: 'text', analyzer: 'custom_vn_analyzer' },
                isMain: { type: 'boolean' },
              },
            },

            // Attributes
            attributes: {
              type: 'nested',
              properties: {
                attributeId: { type: 'keyword' },
                attributeName: { type: 'keyword' },
                value: { type: 'text', analyzer: 'custom_vn_analyzer' },
                displayName: { type: 'text', analyzer: 'custom_vn_analyzer' },
                colorCode: { type: 'keyword' },
              },
            },

            // Variation values
            variationValues: {
              type: 'nested',
              properties: {
                attributeId: { type: 'keyword' },
                attributeName: { type: 'keyword' },
                value: { type: 'text', analyzer: 'custom_vn_analyzer' },
                displayName: { type: 'text', analyzer: 'custom_vn_analyzer' },
                colorCode: { type: 'keyword' },
              },
            },

            // Availability
            isInStock: { type: 'boolean' },
            isDiscounted: { type: 'boolean' },
          },
        },
      });
    }
  }

  private async createAttributesIndex(): Promise<void> {
    const exists = await this.es.indices.exists({ index: 'attributes' });
    if (!exists) {
      await this.es.indices.create({
        index: 'attributes',
        settings: this.getCommonSettings(),
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: { type: 'keyword' },
            displayName: {
              type: 'text',
              analyzer: 'custom_vn_analyzer',
              fields: {
                keyword: { type: 'keyword' },
              },
            },
            type: { type: 'keyword' },
            isRequired: { type: 'boolean' },
            isVariation: { type: 'boolean' },
            sortOrder: { type: 'integer' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },

            // Attribute values
            values: {
              type: 'nested',
              properties: {
                id: { type: 'keyword' },
                value: { type: 'text', analyzer: 'custom_vn_analyzer' },
                displayName: { type: 'text', analyzer: 'custom_vn_analyzer' },
                colorCode: { type: 'keyword' },
                imageUrl: { type: 'keyword', index: false },
                sortOrder: { type: 'integer' },
                isActive: { type: 'boolean' },
              },
            },
          },
        },
      });
    }
  }

  private async createTagsIndex(): Promise<void> {
    const exists = await this.es.indices.exists({ index: 'tags' });
    if (!exists) {
      await this.es.indices.create({
        index: 'tags',
        settings: this.getCommonSettings(),
        mappings: {
          properties: {
            id: { type: 'keyword' },
            name: {
              type: 'text',
              analyzer: 'custom_vn_analyzer',
              fields: {
                keyword: { type: 'keyword' },
                autocomplete: { type: 'text', analyzer: 'autocomplete_analyzer' },
              },
            },
            slug: { type: 'keyword' },
            color: { type: 'keyword' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
            usageCount: { type: 'integer' },
          },
        },
      });
    }
  }
}
