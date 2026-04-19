import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  providers: [SeederService],
})
export class SeederModule {}
