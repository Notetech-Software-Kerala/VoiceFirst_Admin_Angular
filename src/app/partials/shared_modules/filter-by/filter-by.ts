import { Component, EventEmitter, HostListener, Input, Output, SimpleChanges } from '@angular/core';

export interface FilterOption {
  label: string;
  key: string;
  options: string[];
  single?: boolean;
}

@Component({
  selector: 'app-filter-by',
  standalone: true,
  imports: [],
  templateUrl: './filter-by.html',
  styleUrl: './filter-by.css',
})
export class FilterBy {
  @Input() filters: FilterOption[] = [];
  @Input() activeFilters: Record<string, string[]> = {};
  @Input() clearSignal = 0;

  @Output() filterChange = new EventEmitter<Record<string, string[]>>();

  showDropdown = false;
  selectedValues: Record<string, string[]> = {};

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!(event.target as HTMLElement).closest('.filter-by')) {
      this.showDropdown = false;
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  toggleValue(key: string, value: string, checked: boolean) {
    const isSingle = !!this.filters.find(f => f.key === key)?.single;

    if (isSingle) {
      // ✅ single selection behavior (checkbox UI, radio logic)
      if (checked) {
        this.selectedValues[key] = [value];
      } else {
        delete this.selectedValues[key];
      }
      this.filterChange.emit({ ...this.selectedValues });
      return;
    }

    // ✅ multi selection (existing behavior)
    if (!this.selectedValues[key]) this.selectedValues[key] = [];

    if (checked) {
      this.selectedValues[key].push(value);
    } else {
      this.selectedValues[key] = this.selectedValues[key].filter(v => v !== value);
      if (this.selectedValues[key].length === 0) delete this.selectedValues[key];
    }

    this.filterChange.emit({ ...this.selectedValues });
  }

  isChecked(key: string, value: string): boolean {
    return this.selectedValues[key]?.includes(value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeFilters'] && this.activeFilters) {
      this.selectedValues = JSON.parse(JSON.stringify(this.activeFilters));
    }

    if (changes['clearSignal']) {
      this.selectedValues = {};
    }
  }
}
