import { Component, ChangeDetectorRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ProductsService } from '../../services/products.service';
import { ReviewsService } from '../../services/reviews.service';
import { Product } from '../../models/product.interface';
import { CreateReview, Review } from '../../models/review.interface';
import { StarRatingComponent } from '../../components/star-rating/star-rating.component';
import { ReviewFormComponent } from '../../components/review-form/review-form.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    StarRatingComponent,
    ReviewFormComponent,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  @ViewChild(ReviewFormComponent) reviewForm!: ReviewFormComponent;

  product: Product | null = null;
  reviews: Review[] = [];
  loading = true;

  reviewsPage = 1;
  reviewsLimit = 5;
  reviewsTotalPages = 1;

  private productId = '';

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private reviewsService: ReviewsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.productId = id;

    this.productsService.getProduct(id).subscribe({
      next: (product) => {
        this.product = product;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });

    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewsService
      .getReviews(this.productId, this.reviewsPage, this.reviewsLimit)
      .subscribe({
        next: (res) => {
          this.reviews = res.data;
          this.reviewsTotalPages = res.totalPages;
          this.reviewsPage = res.page;
          this.cdr.markForCheck();
        },
      });
  }

  goToReviewsPage(page: number): void {
    if (page < 1 || page > this.reviewsTotalPages) return;
    this.reviewsPage = page;
    this.loadReviews();
  }

  get reviewPages(): number[] {
    return Array.from({ length: this.reviewsTotalPages }, (_, i) => i + 1);
  }

  onReviewSubmit(review: CreateReview): void {
    this.reviewsService.createReview(review).subscribe({
      next: () => {
        this.reviewForm.reset();

        // Reset to page 1 to see the new review at top
        this.reviewsPage = 1;
        this.loadReviews();

        // Refresh product to get updated rating
        this.productsService.getProduct(this.productId).subscribe({
          next: (updated) => {
            this.product = updated;
            this.cdr.markForCheck();
          },
        });

        this.cdr.markForCheck();
      },
      error: () => {
        this.reviewForm.submitting = false;
        this.cdr.markForCheck();
      },
    });
  }
}
