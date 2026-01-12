import { Component, EventEmitter, HostListener, Input, Output, SimpleChanges } from '@angular/core';

export interface FilterOption {
  label: string;               // e.g. "City"
  key: string;                 // e.g. "city"
  options: string[];           // e.g. ["New York", "London", "Tokyo"]
}

@Component({
  selector: 'app-filter-by',
  imports: [],
  templateUrl: './filter-by.html',
  styleUrl: './filter-by.css',
})
export class FilterBy {
  @Input() filters: FilterOption[] = [];
  @Input() activeFilters: Record<string, string[]> = {}; // 🔹 new input
  @Input() clearSignal = 0; // 🔹 trigger for Clear All

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
    if (!this.selectedValues[key]) this.selectedValues[key] = [];

    if (checked) {
      this.selectedValues[key].push(value);
    } else {
      this.selectedValues[key] = this.selectedValues[key].filter(v => v !== value);
      if (this.selectedValues[key].length === 0) delete this.selectedValues[key];
    }

    // Emit updated filters immediately
    this.filterChange.emit({ ...this.selectedValues });
  }

  isChecked(key: string, value: string): boolean {
    return this.selectedValues[key]?.includes(value);
  }

  /** 🔹 When Table component clears filters or removes one, update internal state */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeFilters'] && this.activeFilters) {
      this.selectedValues = JSON.parse(JSON.stringify(this.activeFilters));
    }

    // Detect clearSignal increment → clear all
    if (changes['clearSignal']) {
      this.selectedValues = {};
    }
  }
}
