import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    const review = new this.reviewModel({
      ...createReviewDto,
      productId: new Types.ObjectId(createReviewDto.productId),
    });
    const saved = await review.save();
    return saved as Review;
  }

  async findByProductIdPaginated(
    productId: string,
    skip: number,
    limit: number,
  ): Promise<{ data: Review[]; total: number }> {
    const filter = { productId: new Types.ObjectId(productId) };
    const [data, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments(filter).exec(),
    ]);
    return { data: data as Review[], total };
  }

  async aggregateRating(
    productId: string,
  ): Promise<{ averageRating: number; reviewCount: number }> {
    const result = await this.reviewModel.aggregate<{
      _id: Types.ObjectId;
      averageRating: number;
      reviewCount: number;
    }>([
      { $match: { productId: new Types.ObjectId(productId) } },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (result.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }

    return {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      reviewCount: result[0].reviewCount,
    };
  }
}
