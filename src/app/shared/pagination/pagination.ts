import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';

@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'pagination',
  },
  template: `
    <div class="pagination-info">
      Showing {{ startItem() }}–{{ endItem() }} of {{ totalItems() }}
    </div>

    <div class="pagination-controls">
      <button
        (click)="goToPage(1)"
        [disabled]="currentPage() === 1"
        aria-label="First page"
      >
        &#171;
      </button>
      <button
        (click)="goToPage(currentPage() - 1)"
        [disabled]="currentPage() === 1"
        aria-label="Previous page"
      >
        &#8249;
      </button>

      @for (page of visiblePages(); track page) {
        <button
          [class.active]="page === currentPage()"
          (click)="goToPage(page)"
          [attr.aria-current]="page === currentPage() ? 'page' : null"
        >
          {{ page }}
        </button>
      }

      <button
        (click)="goToPage(currentPage() + 1)"
        [disabled]="currentPage() === totalPages()"
        aria-label="Next page"
      >
        &#8250;
      </button>
      <button
        (click)="goToPage(totalPages())"
        [disabled]="currentPage() === totalPages()"
        aria-label="Last page"
      >
        &#187;
      </button>
    </div>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      font-size: 0.875rem;
      color: #64748b;
    }

    .pagination-controls {
      display: flex;
      gap: 4px;
    }

    button {
      min-width: 36px;
      height: 36px;
      padding: 0 8px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #fff;
      color: #334155;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover:not(:disabled):not(.active) {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }

      &.active {
        background: #3b82f6;
        border-color: #3b82f6;
        color: #fff;
        font-weight: 600;
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    }
  `,
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
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
