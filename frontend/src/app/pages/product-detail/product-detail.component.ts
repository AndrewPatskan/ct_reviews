import { Component, OnInit, ViewChild, signal, computed } from '@angular/core';
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

  product = signal<Product | null>(null);
  reviews = signal<Review[]>([]);
  loading = signal(true);

  reviewsPage = signal(1);
  reviewsLimit = 5;
  reviewsTotalPages = signal(1);

  reviewPages = computed(() =>
    Array.from({ length: this.reviewsTotalPages() }, (_, i) => i + 1),
  );

  private productId = '';

  constructor(
    private route: ActivatedRoute,
    private productsService: ProductsService,
    private reviewsService: ReviewsService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.productId = id;

    this.productsService.getProduct(id).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });

    this.loadReviews();
  }

  loadReviews(): void {
    this.reviewsService
      .getReviews(this.productId, this.reviewsPage(), this.reviewsLimit)
      .subscribe({
        next: (res) => {
          this.reviews.set(res.data);
          this.reviewsTotalPages.set(res.totalPages);
          this.reviewsPage.set(res.page);
        },
      });
  }

  goToReviewsPage(page: number): void {
    if (page < 1 || page > this.reviewsTotalPages()) return;
    this.reviewsPage.set(page);
    this.loadReviews();
  }

  onReviewSubmit(review: CreateReview): void {
    this.reviewsService.createReview(review).subscribe({
      next: () => {
        this.reviewForm.reset();

        // Reset to page 1 to see the new review at top
        this.reviewsPage.set(1);
        this.loadReviews();

        // Refresh product to get updated rating
        this.productsService.getProduct(this.productId).subscribe({
          next: (updated) => {
            this.product.set(updated);
          },
        });
      },
      error: () => {
        this.reviewForm.submitting = false;
      },
    });
  }
}
