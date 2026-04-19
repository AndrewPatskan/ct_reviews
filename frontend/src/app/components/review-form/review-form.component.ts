import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateReview } from '../../models/review.interface';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './review-form.component.html',
  styleUrl: './review-form.component.scss',
})
export class ReviewFormComponent {
  @Input() productId = '';
  @Output() submitReview = new EventEmitter<CreateReview>();

  author = '';
  rating = 5;
  text = '';
  submitting = false;

  onSubmit(): void {
    if (!this.author.trim() || !this.text.trim()) return;

    this.submitting = true;
    this.submitReview.emit({
      productId: this.productId,
      author: this.author.trim(),
      rating: this.rating,
      text: this.text.trim(),
    });
  }

  reset(): void {
    this.author = '';
    this.rating = 5;
    this.text = '';
    this.submitting = false;
  }
}
