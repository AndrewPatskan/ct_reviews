import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './schemas/review.schema';
import { RedisService } from '../redis/redis.service';
import { ReviewsRepository } from './reviews.repository';
import { ProductsRepository } from '../products/products.repository';

interface PaginatedReviews {
  data: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class ReviewsService {
  private readonly CACHE_PREFIX = 'reviews';

  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly redisService: RedisService,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const result = await this.reviewsRepository.create(createReviewDto);

    // Recalculate and persist rating on the product
    const { averageRating, reviewCount } =
      await this.reviewsRepository.aggregateRating(createReviewDto.productId);
    await this.productsRepository.updateRating(
      createReviewDto.productId,
      averageRating,
      reviewCount,
    );

    // Invalidate caches
    await Promise.all([
      this.redisService.delByPattern(
        `${this.CACHE_PREFIX}:product:${createReviewDto.productId}*`,
      ),
      this.redisService.del(`products:${createReviewDto.productId}`),
      this.redisService.delByPattern('products:list*'),
    ]);

    return result;
  }

  async findByProduct(
    productId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedReviews> {
    const cacheKey = `${this.CACHE_PREFIX}:product:${productId}:${page}:${limit}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached) as PaginatedReviews;
    }

    const skip = (page - 1) * limit;
    const paginatedResult =
      await this.reviewsRepository.findByProductIdPaginated(
        productId,
        skip,
        limit,
      );

    const response: PaginatedReviews = {
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
}
