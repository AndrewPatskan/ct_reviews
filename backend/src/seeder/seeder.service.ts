import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProductsRepository } from '../products/products.repository';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    const nodeEnv = this.configService.get<string>('NODE_ENV');

    if (nodeEnv !== 'development') {
      this.logger.log(`Seeder skipped (NODE_ENV=${nodeEnv ?? 'undefined'}).`);
      return;
    }

    const existing = await this.productsRepository.findAllPaginated(0, 1);

    if (existing.total > 0) {
      this.logger.log(
        `Database already has ${existing.total} products, skipping seed.`,
      );
      return;
    }

    this.logger.log('Database is empty. Seeding default test products...');

    const defaultProducts = [
      {
        name: 'CloudTalk Pro Software',
        description:
          'Advanced cloud phone system for sales and support teams globally.',
        price: 199.99,
        imageUrl:
          'https://dummyimage.com/400x400/0047fa/fff.png&text=CloudTalk+Pro',
      },
      {
        name: 'CloudTalk VoIP Headset',
        description: 'Enterprise-grade wireless noise-cancelling headset.',
        price: 89.5,
        imageUrl:
          'https://dummyimage.com/400x400/222222/fff.png&text=CT+Headset',
      },
      {
        name: 'Live Sentiment Analyzer',
        description:
          'AI module that analyzes user feelings during live calls.',
        price: 49.99,
        imageUrl:
          'https://dummyimage.com/400x400/00b85c/fff.png&text=AI+Module',
      },
      {
        name: 'CRM Integration Sync',
        description:
          'Seamlessly matches and synchronizes call data with Salesforce/Hubspot.',
        price: 29.99,
        imageUrl:
          'https://dummyimage.com/400x400/ff4d4f/fff.png&text=CRM+Sync',
      },
      {
        name: 'CloudTalk Desk Phone X',
        description: 'Hardware VoIP desk phone with HD audio.',
        price: 129.0,
        imageUrl:
          'https://dummyimage.com/400x400/666666/fff.png&text=Desk+Phone+X',
      },
    ];

    for (const product of defaultProducts) {
      await this.productsRepository.create(product);
    }

    this.logger.log(
      `Successfully seeded ${defaultProducts.length} default products.`,
    );
  }
}
