import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { EncryptionService } from '../../partials/shared_services/encryption.service';
import { QueryParameterModel } from '../_models/query-parameter.model';
import { FilterOption } from '../../partials/shared_modules/filter-by/filter-by';
import { SortEvent } from '../../partials/shared_directives/sortable-column';

@Component({
    template: ''
})
export abstract class BaseListComponent implements OnInit, OnDestroy {
    destroy$ = new Subject<void>();

    // State
    queryParams: QueryParameterModel = {};
    currentPage = 1;
    pageSize = 10;
    totalCount = 0;
    totalPages = 0;
    pageSizes = [5, 10, 20, 50];
    isSearching = false;

    // Filters
    filterOptions: FilterOption[] = [];
    activeFilters: Record<string, string[]> = {};
    statusFilters: { Active?: boolean; Deleted?: boolean } = {}; // Common filter pattern
    clearSignal = 0;

    // Search
    searchByOptions: { label: string; value: string }[] = [];

    constructor(
        protected router: Router,
        protected route: ActivatedRoute,
        protected encryptionService: EncryptionService,
        protected cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // Initial load handled by route subscription
        this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
            if (params['q']) {
                const decrypted = this.encryptionService.decrypt(params['q']);
                if (decrypted) {
                    this.queryParams = decrypted;

                    // Restore pagination state
                    if (this.queryParams.PageNumber) this.currentPage = Number(this.queryParams.PageNumber);
                    if (this.queryParams.Limit) this.pageSize = Number(this.queryParams.Limit);

                    // Restore UI filters logic (abstract if needed, or default impl)
                    this.restoreFiltersFromParams();
                }
            } else {
                // No encrypted params (first load or cleared), ensure defaults
                this.queryParams.PageNumber = this.currentPage;
                this.queryParams.Limit = this.pageSize;
            }

            this.loadData();
        });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Abstract method that children must implement to dispatch store actions
    abstract loadData(): void;

    // --- Common Handlers ---

    onSearch(searchText: string) {
        this.queryParams = {
            ...this.queryParams,
            SearchText: searchText,
            PageNumber: 1
        };
        this.currentPage = 1;
        this.isSearching = false;
        this.updateUrl();
    }

    onTypingChange(isTyping: boolean) {
        this.isSearching = isTyping;
        this.cdr.markForCheck();
    }

    onSearchByChange(searchBy: string) {
        this.queryParams = {
            ...this.queryParams,
            SearchBy: searchBy || undefined,
            PageNumber: 1
        };
        this.currentPage = 1;
        if (this.queryParams.SearchText) {
            this.updateUrl();
        }
    }

    onSortChange(event: SortEvent) {
        this.queryParams = {
            ...this.queryParams,
            SortBy: event.column,
            SortOrder: event.direction
        };
        this.updateUrl();
    }

    onPaginationChange(event: { page: number; size: number }) {
        this.currentPage = event.page;
        this.pageSize = event.size;
        this.queryParams = {
            ...this.queryParams,
            PageNumber: event.page,
            Limit: event.size
        };
        this.updateUrl();
    }

    // Generic filter handler
    onFilterChange(filters: Record<string, string[]>) {
        this.activeFilters = filters;

        // Reset common status filters
        this.statusFilters = {};
        delete (this.queryParams as any)['Active'];
        delete (this.queryParams as any)['Deleted'];

        // Default status handling - overridable by children if they have custom logic
        this.applyStatusFilter(filters);

        // Generic handling for other filters
        const otherFilters: Record<string, any> = {};
        Object.keys(filters).forEach(key => {
            // Skip status if handled, otherwise process
            if (key !== 'status' && filters[key]?.length > 0) {
                const values = filters[key];
                otherFilters[key] = values.length === 1 ? values[0] : values.join(',');
            }
        });

        this.queryParams = {
            ...this.queryParams,
            ...otherFilters,
            ...this.statusFilters,
            PageNumber: 1
        };

        this.currentPage = 1;
        this.updateUrl();
    }

    // Extension point for status logic
    protected applyStatusFilter(filters: Record<string, string[]>) {
        const status = filters['status']?.[0];
        if (status === 'Active') {
            this.statusFilters.Active = true;
            this.statusFilters.Deleted = false;
        } else if (status === 'Inactive') {
            this.statusFilters.Active = false;
            this.statusFilters.Deleted = false;
        } else if (status === 'Deleted') {
            this.statusFilters.Deleted = true;
        }
    }

    removeFilter(key: string, value: string) {
        if (!this.activeFilters[key]) return;
        this.activeFilters[key] = this.activeFilters[key].filter(v => v !== value);
        if (this.activeFilters[key].length === 0) delete this.activeFilters[key];
        this.onFilterChange({ ...this.activeFilters });
    }

    clearAllFilters() {
        // Basic clearing strategy
        const filterKeys = this.filterOptions.map(f => f.key);
        filterKeys.forEach(key => {
            delete (this.queryParams as any)[key];
        });
        delete (this.queryParams as any)['Active'];
        delete (this.queryParams as any)['Deleted'];

        this.activeFilters = {};
        this.clearSignal++;
        this.onFilterChange({});
    }

    updateUrl() {
        const encrypted = this.encryptionService.encrypt(this.queryParams);
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { q: encrypted }
        });
    }

    // Restore UI from params (inverse of applyStatusFilter)
    protected restoreFiltersFromParams() {
        this.activeFilters = {};
        const p = this.queryParams as any;

        // Default restoration logic for Status
        if (p.Deleted === true) {
            this.activeFilters['status'] = ['Deleted'];
        } else if (p.Active === true) {
            this.activeFilters['status'] = ['Active'];
        } else if (p.Active === false) {
            this.activeFilters['status'] = ['Inactive'];
        }

        // We could try to restore other keys if they match filterOptions, 
        // but without the original array structure knowledge (it was joined to string), 
        // it's a best-effort.
        // For now, assuming status is the main complex one.
    }
}
