import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() pageSizes: number[] = [5, 10, 20];
  @Input() currentPage = 1;

  // Individual events (for backward compatibility)
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  // Combined event - emits both page and size together
  @Output() paginationChange = new EventEmitter<{ page: number; size: number }>();

  Math = Math;

  /** Total number of pages */
  totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  /** Emit new page change */
  changePage(page: number) {
    const total = this.totalPages();
    const newPage = Math.min(Math.max(1, page), total || 1);

    // Emit both individual and combined events
    this.pageChange.emit(newPage);
    this.paginationChange.emit({ page: newPage, size: this.pageSize });
  }

  /** Change number of items per page */
  changePageSize(size: number | string) {
    const newSize = Number(size);

    // Emit both individual and combined events (reset to page 1)
    this.pageSizeChange.emit(newSize);
    this.paginationChange.emit({ page: 1, size: newSize });
  }

  /** Pagination window like [1, …, 7, 8, 9, …, 20] */
  pageWindow(maxButtons = 7): (number | '…')[] {
    const total = this.totalPages();
    const cur = this.currentPage;

    if (total <= maxButtons) return Array.from({ length: total }, (_, i) => i + 1);

    const windowSize = 3;
    const left = Math.max(2, cur - windowSize);
    const right = Math.min(total - 1, cur + windowSize);
    const pages: (number | '…')[] = [1];

    if (left > 2) pages.push('…');
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < total - 1) pages.push('…');

    pages.push(total);
    return pages;
  }

  onPageClick(p: number | '…') {
    if (p === '…') return;
    this.changePage(p);
  }

  nextPage() { this.changePage(this.currentPage + 1); }
  prevPage() { this.changePage(this.currentPage - 1); }
  firstPage() { this.changePage(1); }
  lastPage() { this.changePage(this.totalPages()); }
}
