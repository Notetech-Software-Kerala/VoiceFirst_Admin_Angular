import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-search-bar',
  imports: [MaterialModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {
  /** Placeholder text (defaults to "Search...") */
  @Input() placeholder = 'Search...';

  /** Two-way binding value */
  @Input() value = '';

  /** Event emitted when input changes */
  @Output() valueChange = new EventEmitter<string>();

  /** Optional label/title */
  @Input() label?: string;

  @Input() tooltipText = 'Enter text to search';

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.valueChange.emit(this.value);
  }

  clearInput() {
    this.value = '';
    this.valueChange.emit('');
  }
}
