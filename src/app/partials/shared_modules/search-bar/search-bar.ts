import { Component, EventEmitter, Input, Output, OnInit, OnDestroy } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  imports: [MaterialModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar implements OnInit, OnDestroy {
  /** Placeholder text (defaults to "Search...") */
  @Input() placeholder = 'Search...';

  /** Two-way binding value */
  @Input() value = '';

  /** Debounce time in milliseconds (default: 500ms) */
  @Input() debounceTime = 2000;

  /** Event emitted when input changes (debounced) */
  @Output() valueChange = new EventEmitter<string>();

  /** Event emitted immediately when user starts typing (not debounced) */
  @Output() typingChange = new EventEmitter<boolean>();

  /** SearchBy dropdown options (optional) */
  @Input() searchByOptions: { label: string; value: string }[] = [];

  /** Selected SearchBy value */
  @Input() searchByValue: string = '';

  /** Event emitted when SearchBy dropdown changes */
  @Output() searchByChange = new EventEmitter<string>();

  /** Optional label/title */
  @Input() label?: string;

  @Input() tooltipText = 'Enter text to search';

  private searchSubject$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Setup debounced search
    this.searchSubject$.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.typingChange.emit(false); // Typing stopped
      this.valueChange.emit(value);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.typingChange.emit(true); // User is typing
    this.searchSubject$.next(this.value); // Emit to debounced subject
  }

  clearInput() {
    this.value = '';
    this.searchSubject$.next(''); // Emit to debounced subject
  }

  onSearchByChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.searchByValue = select.value;
    this.searchByChange.emit(this.searchByValue);
  }
}
