import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'kim-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'pagination' },
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class Pagination {
  currentPage = input.required<number>();
  totalItems = input.required<number>();
  pageSize = input(10);

  pageChange = output<number>();

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.pageSize()))
  );

  startItem = computed(() =>
    this.totalItems() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1
  );

  endItem = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalItems())
  );

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    const end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) return;

    this.pageChange.emit(page);
  }
}
