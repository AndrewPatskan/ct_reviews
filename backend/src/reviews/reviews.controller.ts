import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './schemas/review.schema';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  async create(@Body() createReviewDto: CreateReviewDto): Promise<Review> {
    return await this.reviewsService.create(createReviewDto);
  }

  @Get('product/:productId')
  async findByProduct(
    @Param('productId') productId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '5',
  ): Promise<{
    data: Review[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await this.reviewsService.findByProduct(
      productId,
      Number(page),
      Number(limit),
    );
  }
}
