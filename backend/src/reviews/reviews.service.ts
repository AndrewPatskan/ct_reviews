import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './schemas/review.schema';
import { RedisService } from '../redis/redis.service';
import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  private readonly CACHE_PREFIX = 'reviews';

  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly redisService: RedisService,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const result = await this.reviewsRepository.create(createReviewDto);

    // Invalidate product's reviews cache
    await this.redisService.del(
      `${this.CACHE_PREFIX}:product:${createReviewDto.productId}`,
    );

    return result;
  }

  async findByProduct(productId: string): Promise<Review[]> {
    const cacheKey = `${this.CACHE_PREFIX}:product:${productId}`;
    const cachedReviews = await this.redisService.get(cacheKey);

    if (cachedReviews) {
      return JSON.parse(cachedReviews) as Review[];
    }

    const reviews = await this.reviewsRepository.findByProductId(productId);

    // Cache reviews for 1 hour
    await this.redisService.set(cacheKey, JSON.stringify(reviews), 3600);

    return reviews;
  }
}
