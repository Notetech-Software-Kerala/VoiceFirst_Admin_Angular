import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, OnChanges } from '@angular/core';

export interface SortEvent {
  column: string;
  direction: 'Asc' | 'Desc';
}

@Directive({
  selector: '[appSortableColumn]',
  standalone: true
})
export class SortableColumnDirective implements OnChanges {
  @Input('appSortableColumn') column!: string;
  @Input() sortBy?: string;
  @Input() sortOrder?: 'Asc' | 'Desc';
  @Output() sortChange = new EventEmitter<SortEvent>();

  constructor(private el: ElementRef) {
    this.el.nativeElement.style.cursor = 'pointer';
    this.el.nativeElement.style.userSelect = 'none';
  }

  ngOnChanges() {
    this.updateIcon();
  }

  @HostListener('click')
  onClick() {
    const newDirection: 'Asc' | 'Desc' =
      this.sortBy === this.column && this.sortOrder === 'Asc' ? 'Desc' : 'Asc';

    this.sortChange.emit({
      column: this.column,
      direction: newDirection
    });
  }

  private updateIcon() {
    // Remove existing icon if any
    const existing = this.el.nativeElement.querySelector('.sort-icon');
    if (existing) {
      existing.remove();
    }

    // Determine icon based on sort state
    let icon = '⇅'; // Default unsorted
    if (this.sortBy === this.column) {
      icon = this.sortOrder === 'Asc' ? '↑' : '↓';
    }

    // Create and append icon element
    const iconEl = document.createElement('small');
    iconEl.className = 'sort-icon';
    iconEl.textContent = ` ${icon}`;
    iconEl.style.marginLeft = '4px';
    iconEl.style.fontSize = '14px';
    iconEl.style.opacity = this.sortBy === this.column ? '1' : '0.6';

    this.el.nativeElement.appendChild(iconEl);
  }
}
