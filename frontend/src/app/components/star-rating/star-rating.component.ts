import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.scss',
})
export class StarRatingComponent {
  @Input() rating = 0;
  @Input() size: 'sm' | 'md' = 'md';

  get stars(): ('full' | 'empty')[] {
    return Array.from({ length: 5 }, (_, i) =>
      i < Math.round(this.rating) ? 'full' : 'empty'
    );
  }
}
