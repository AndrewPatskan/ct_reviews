import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { Product } from './schemas/product.schema';
import { RedisService } from '../redis/redis.service';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  private readonly CACHE_PREFIX = 'products';

  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly redisService: RedisService,
  ) {}

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
