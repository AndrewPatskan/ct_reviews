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

  async findByProductId(productId: string): Promise<Review[]> {
    const reviews = await this.reviewModel
      .find({ productId: new Types.ObjectId(productId) })
      .sort({ createdAt: -1 })
      .exec();
    return reviews as Review[];
  }
}
