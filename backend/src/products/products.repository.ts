import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const createdProduct = new this.productModel(createProductDto);
    const saved = await createdProduct.save();
    return saved as Product;
  }

  async findAllPaginated(
    skip: number,
    limit: number,
  ): Promise<{ data: Product[]; total: number }> {
    const [data, total] = await Promise.all([
      this.productModel.find().skip(skip).limit(limit).exec(),
      this.productModel.countDocuments().exec(),
    ]);
    return { data: data as Product[], total };
  }

  async findById(id: string): Promise<Product | null> {
    const doc = await this.productModel.findById(id).exec();
    return doc as Product | null;
  }
}
