import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './schemas/product.schema';
import { RedisService } from '../redis/redis.service';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly CACHE_PREFIX = 'products';

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    const existingProducts = await this.productsRepository.findAllPaginated(
      0,
      1,
    );
    if (existingProducts.total === 0) {
      console.log('Database is empty. Seeding default test products...');
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

      await this.redisService.delByPattern(`${this.CACHE_PREFIX}:list*`);
      console.log('Successfully seeded 5 default products!');
    }
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const result = await this.productsRepository.create(createProductDto);

    // Invalidate all product list paginated caches
    await this.redisService.delByPattern(`${this.CACHE_PREFIX}:list*`);

    return result;
  }

  async findAll(page: number, limit: number) {
    const cacheKey = `${this.CACHE_PREFIX}:list:${page}:${limit}`;
    const cachedProducts = await this.redisService.get(cacheKey);

    if (cachedProducts) {
      return JSON.parse(cachedProducts) as {
        data: Product[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }

    const skip = (page - 1) * limit;
    const paginatedResult = await this.productsRepository.findAllPaginated(
      skip,
      limit,
    );

    const response = {
      data: paginatedResult.data,
      total: paginatedResult.total,
      page,
      limit,
      totalPages: Math.ceil(paginatedResult.total / limit),
    };

    // Cache for 1 hour
    await this.redisService.set(cacheKey, JSON.stringify(response), 3600);

    return response;
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = `${this.CACHE_PREFIX}:${id}`;
    const cachedProduct = await this.redisService.get(cacheKey);

    if (cachedProduct) {
      return JSON.parse(cachedProduct) as Product;
    }

    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product #${id} not found`);
    }

    // Cache specific product
    await this.redisService.set(cacheKey, JSON.stringify(product), 3600);

    return product;
  }
}
