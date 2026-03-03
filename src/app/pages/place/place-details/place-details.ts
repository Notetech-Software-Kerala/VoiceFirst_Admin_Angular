import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { PlaceModel } from '../../../core/_state/place/place.model';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaceService } from '../../../core/_state/place/place.service';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { PlaceActions } from '../../../core/_state/place/place.action';
import { MaterialModule } from '../../../material.module';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { DetailsLoaderComponent } from '../../../partials/shared_modules/details-loader/details-loader.component';
import { FormsModule } from '@angular/forms';
import { CountryService } from '../../../core/_state/country/country.service';
import { CountryModel, DivisionOneModel, DivisionTwoModel, DivisionThreeModel } from '../../../core/_state/country/country.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
@Component({
  selector: 'app-place-details',
  imports: [CommonModule, MaterialModule, StatusBadge, DetailsLoaderComponent, FormsModule],
  templateUrl: './place-details.html',
  styleUrl: './place-details.css',
})
export class PlaceDetails implements OnInit, OnDestroy {
  place: PlaceModel | null = null;
  loading = true;
  private destroy$ = new Subject<void>();
  placeId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private placeService: PlaceService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    public utilityService: UtilityService,
    private store: Store,
    private location: Location,
    private dialog: MatDialog,
    private encryptionService: EncryptionService,
    private countryService: CountryService
  ) { }

  ngOnInit(): void {
    // Setup debounced search streams
    this.searchCountrySubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchCountryText = searchText;
      this.countryPage = 1;
      this.countryList = [];
      this.loadCountryLookup();
    });

    this.searchDivOneSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchDivOneText = searchText;
      if (this.selectedCountryId) {
        this.divOnePage = 1;
        this.divisionOneList = [];
        this.fetchDivisionOne(this.selectedCountryId);
      }
    });

    this.searchDivTwoSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchDivTwoText = searchText;
      if (this.selectedDivOneId) {
        this.divTwoPage = 1;
        this.divisionTwoList = [];
        this.fetchDivisionTwo(this.selectedDivOneId);
      }
    });

    this.searchDivThreeSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchDivThreeText = searchText;
      if (this.selectedDivTwoId) {
        this.divThreePage = 1;
        this.divisionThreeList = [];
        this.fetchDivisionThree(this.selectedDivTwoId);
      }
    });

    // Initial load
    this.loadCountryLookup();

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const encryptedId = params.get('id');
      if (encryptedId) {
        const decryptedId = this.encryptionService.decryptFromRoute(encryptedId);
        if (decryptedId) {
          this.placeId = +decryptedId;
          this.loadPlaceDetails(this.placeId);
        } else {
          this.toastService.error('Invalid Place ID', 'Error');
          this.goBack();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  flattenedZipCodes: any[] = [];
  filteredZipCodes: any[] = [];

  // Filter State
  searchText: string = '';
  selectedCountryId: number | '' = '';
  selectedDivOneId: number | '' = '';
  selectedDivTwoId: number | '' = '';
  selectedDivThreeId: number | '' = '';

  selectedCountryName: string = '';
  selectedDivOneName: string = '';
  selectedDivTwoName: string = '';
  selectedDivThreeName: string = '';

  divOneLabel: string | null = null;
  divTwoLabel: string | null = null;
  divThreeLabel: string | null = null;

  // Master API Lists
  countryList: CountryModel[] = [];
  filteredCountryList: CountryModel[] = [];
  divisionOneList: DivisionOneModel[] = [];
  filteredDivOneList: DivisionOneModel[] = [];
  divisionTwoList: DivisionTwoModel[] = [];
  filteredDivTwoList: DivisionTwoModel[] = [];
  divisionThreeList: DivisionThreeModel[] = [];
  filteredDivThreeList: DivisionThreeModel[] = [];

  // Pagination & Search
  countryPage: number = 1;
  countryTotalPages: number = 1;
  searchCountryText: string = '';
  searchCountrySubject = new Subject<string>();

  divOnePage: number = 1;
  divOneTotalPages: number = 1;
  searchDivOneText: string = '';
  searchDivOneSubject = new Subject<string>();

  divTwoPage: number = 1;
  divTwoTotalPages: number = 1;
  searchDivTwoText: string = '';
  searchDivTwoSubject = new Subject<string>();

  divThreePage: number = 1;
  divThreeTotalPages: number = 1;
  searchDivThreeText: string = '';
  searchDivThreeSubject = new Subject<string>();

  lookupLimit: number = 10;

  loadPlaceDetails(id: number) {
    this.loading = true;
    this.placeService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.place = res.data;
            this.flattenPostOffices();
          } else {
            this.toastService.error(res.message || 'Failed to load place details', 'Error');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading place details', error);
          this.loading = false;
        }
      });
  }

  private flattenPostOffices() {
    this.flattenedZipCodes = [];
    if (!this.place || !this.place.postOffices) {
      this.filteredZipCodes = [];
      return;
    }

    this.place.postOffices.forEach(po => {
      if (po.zipCodes && po.zipCodes.length > 0) {
        po.zipCodes.forEach(zip => {
          this.flattenedZipCodes.push({
            ...zip,
            postOfficeName: po.postOfficeName,
            countryName: po.countryName || 'Unknown Country',
            divisionOneLabel: po.divisionOneLabel,
            divisionOneName: po.divisionOneName,
            divisionTwoLabel: po.divisionTwoLabel,
            divisionTwoName: po.divisionTwoName,
            divisionThreeLabel: po.divisionThreeLabel,
            divisionThreeName: po.divisionThreeName,
          });
        });
      }
    });

    this.applyFilters();
  }

  // --- API Methods for Dropdowns ---

  loadCountryLookup() {
    let params: any = { PageNumber: this.countryPage, Limit: this.lookupLimit };
    if (this.searchCountryText) {
      params.SearchText = this.searchCountryText;
    }
    this.countryService.lookup(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          const items = response.data.items || response.data;
          this.countryList = [...this.countryList, ...items];
          this.countryList = Array.from(new Map(this.countryList.map(item => [item.countryId, item])).values());
          this.filteredCountryList = [...this.countryList];
          this.countryTotalPages = response.data.totalPages || 1;
        }
      }
    });
  }

  onPrevCountryPage(event: Event) {
    event.stopPropagation();
    if (this.countryPage > 1) {
      this.countryPage--;
      this.countryList = [];
      this.loadCountryLookup();
    }
  }

  onNextCountryPage(event: Event) {
    event.stopPropagation();
    if (this.countryPage < this.countryTotalPages) {
      this.countryPage++;
      this.countryList = [];
      this.loadCountryLookup();
    }
  }

  onCountrySearch(event: any) {
    this.searchCountrySubject.next(event.target.value);
  }

  selectCountry(country: CountryModel) {
    this.selectedCountryName = country.countryName;
    this.selectedCountryId = country.countryId;

    // Manage dynamic labels for divisions based on country
    this.divOneLabel = country.divisionOne || 'Division 1';
    this.divTwoLabel = country.divisionTwo || 'Division 2';
    this.divThreeLabel = country.divisionThree || 'Division 3';

    this.onCountryChange(country.countryId);
  }

  onCountryChange(countryId: number) {
    this.selectedDivOneId = '';
    this.selectedDivTwoId = '';
    this.selectedDivThreeId = '';

    this.divisionOneList = [];
    this.filteredDivOneList = [];
    this.selectedDivOneName = '';
    this.searchDivOneText = '';
    this.divOnePage = 1;

    this.divisionTwoList = [];
    this.filteredDivTwoList = [];
    this.selectedDivTwoName = '';
    this.searchDivTwoText = '';
    this.divTwoPage = 1;

    this.divisionThreeList = [];
    this.filteredDivThreeList = [];
    this.selectedDivThreeName = '';
    this.searchDivThreeText = '';
    this.divThreePage = 1;

    this.applyFilters();
    this.fetchDivisionOne(countryId);
  }

  fetchDivisionOne(countryId: any) {
    let params: any = { CountryId: countryId, PageNumber: this.divOnePage, Limit: this.lookupLimit };
    if (this.searchDivOneText) {
      params.SearchText = this.searchDivOneText;
    }
    this.countryService.getDivisionOneLookup(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          const items = response.data.items || response.data;
          this.divisionOneList = [...this.divisionOneList, ...items];
          this.divisionOneList = Array.from(new Map(this.divisionOneList.map(item => [item.divOneId, item])).values());
          this.filteredDivOneList = [...this.divisionOneList];
          this.divOneTotalPages = response.data.totalPages || 1;
        }
      }
    });
  }

  onPrevDivOnePage(event: Event) {
    event.stopPropagation();
    if (this.divOnePage > 1) {
      this.divOnePage--;
      this.divisionOneList = [];
      this.fetchDivisionOne(this.selectedCountryId);
    }
  }

  onNextDivOnePage(event: Event) {
    event.stopPropagation();
    if (this.divOnePage < this.divOneTotalPages) {
      this.divOnePage++;
      this.divisionOneList = [];
      this.fetchDivisionOne(this.selectedCountryId);
    }
  }

  onDivOneSearch(event: any) {
    this.searchDivOneSubject.next(event.target.value);
  }

  selectDivOne(division: DivisionOneModel) {
    this.selectedDivOneName = division.divOneName;
    this.selectedDivOneId = division.divOneId;
    this.onDivisionOneChange(division.divOneId);
  }

  onDivisionOneChange(divOneId: number) {
    this.selectedDivTwoId = '';
    this.selectedDivThreeId = '';

    this.divisionTwoList = [];
    this.filteredDivTwoList = [];
    this.selectedDivTwoName = '';
    this.searchDivTwoText = '';
    this.divTwoPage = 1;

    this.divisionThreeList = [];
    this.filteredDivThreeList = [];
    this.selectedDivThreeName = '';
    this.searchDivThreeText = '';
    this.divThreePage = 1;

    this.applyFilters();
    this.fetchDivisionTwo(divOneId);
  }

  fetchDivisionTwo(divOneId: any) {
    let params: any = { DivisionOneId: divOneId, PageNumber: this.divTwoPage, Limit: this.lookupLimit };
    if (this.searchDivTwoText) {
      params.SearchText = this.searchDivTwoText;
    }
    this.countryService.getDivisionTwoLookup(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          const items = response.data.items || response.data;
          this.divisionTwoList = [...this.divisionTwoList, ...items];
          this.divisionTwoList = Array.from(new Map(this.divisionTwoList.map(item => [item.divTwoId, item])).values());
          this.filteredDivTwoList = [...this.divisionTwoList];
          this.divTwoTotalPages = response.data.totalPages || 1;
        }
      }
    });
  }

  onPrevDivTwoPage(event: Event) {
    event.stopPropagation();
    if (this.divTwoPage > 1) {
      this.divTwoPage--;
      this.divisionTwoList = [];
      this.fetchDivisionTwo(this.selectedDivOneId);
    }
  }

  onNextDivTwoPage(event: Event) {
    event.stopPropagation();
    if (this.divTwoPage < this.divTwoTotalPages) {
      this.divTwoPage++;
      this.divisionTwoList = [];
      this.fetchDivisionTwo(this.selectedDivOneId);
    }
  }

  onDivTwoSearch(event: any) {
    this.searchDivTwoSubject.next(event.target.value);
  }

  selectDivTwo(division: DivisionTwoModel) {
    this.selectedDivTwoName = division.divTwoName;
    this.selectedDivTwoId = division.divTwoId;
    this.onDivisionTwoChange(division.divTwoId);
  }

  onDivisionTwoChange(divTwoId: number) {
    this.selectedDivThreeId = '';

    this.divisionThreeList = [];
    this.filteredDivThreeList = [];
    this.selectedDivThreeName = '';
    this.searchDivThreeText = '';
    this.divThreePage = 1;

    this.applyFilters();
    this.fetchDivisionThree(divTwoId);
  }

  fetchDivisionThree(divTwoId: any) {
    let params: any = { DivisionTwoId: divTwoId, PageNumber: this.divThreePage, Limit: this.lookupLimit };
    if (this.searchDivThreeText) {
      params.SearchText = this.searchDivThreeText;
    }
    this.countryService.getDivisionThreeLookup(params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          const items = response.data.items || response.data;
          this.divisionThreeList = [...this.divisionThreeList, ...items];
          this.divisionThreeList = Array.from(new Map(this.divisionThreeList.map(item => [item.divThreeId, item])).values());
          this.filteredDivThreeList = [...this.divisionThreeList];
          this.divThreeTotalPages = response.data.totalPages || 1;
        }
      }
    });
  }

  onPrevDivThreePage(event: Event) {
    event.stopPropagation();
    if (this.divThreePage > 1) {
      this.divThreePage--;
      this.divisionThreeList = [];
      this.fetchDivisionThree(this.selectedDivTwoId);
    }
  }

  onNextDivThreePage(event: Event) {
    event.stopPropagation();
    if (this.divThreePage < this.divThreeTotalPages) {
      this.divThreePage++;
      this.divisionThreeList = [];
      this.fetchDivisionThree(this.selectedDivTwoId);
    }
  }

  onDivThreeSearch(event: any) {
    this.searchDivThreeSubject.next(event.target.value);
  }

  selectDivThree(division: DivisionThreeModel) {
    this.selectedDivThreeName = division.divThreeName;
    this.selectedDivThreeId = division.divThreeId;
    this.applyFilters();
  }

  onFilterChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.searchText = '';
    this.selectedCountryId = '';
    this.selectedCountryName = '';
    this.selectedDivOneId = '';
    this.selectedDivOneName = '';
    this.selectedDivTwoId = '';
    this.selectedDivTwoName = '';
    this.selectedDivThreeId = '';
    this.selectedDivThreeName = '';
    this.divOneLabel = null;
    this.divTwoLabel = null;
    this.divThreeLabel = null;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredZipCodes = this.flattenedZipCodes.filter(z => {
      // Free Text Search (Zip or PO Name)
      const matchesSearch = !this.searchText ||
        z.zipCode?.toLowerCase().includes(this.searchText.toLowerCase()) ||
        z.postOfficeName?.toLowerCase().includes(this.searchText.toLowerCase());

      // Filter by names since our flattened object has names 
      // AND the dropdown items provide us the selected names.
      const matchesCountry = !this.selectedCountryName || z.countryName?.toLowerCase() === this.selectedCountryName.toLowerCase();
      const matchesDivOne = !this.selectedDivOneName || z.divisionOneName?.toLowerCase() === this.selectedDivOneName.toLowerCase();
      const matchesDivTwo = !this.selectedDivTwoName || z.divisionTwoName?.toLowerCase() === this.selectedDivTwoName.toLowerCase();
      const matchesDivThree = !this.selectedDivThreeName || z.divisionThreeName?.toLowerCase() === this.selectedDivThreeName.toLowerCase();

      return matchesSearch && matchesCountry && matchesDivOne && matchesDivTwo && matchesDivThree;
    });
  }

  goBack() {
    this.location.back();
  }

  onEdit() {
    if (this.place) {
      const encryptedId = this.encryptionService.encryptForRoute(this.place.placeId);
      this.router.navigate(['/place/edit', encryptedId]);
    }
  }

  onDelete() {
    if (!this.place) return;

    this.confirmationService.confirmDelete(this.place.placeName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.placeService.delete(this.place!.placeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Place deleted successfully', 'Success');
                this.place = { ...this.place!, deleted: true, active: false };
                this.loadPlaceDetails(this.placeId);
              }
            },
            error: (error) => {
              console.error(error);
            }
          })
        }
      });
  }

  onSuspend() {
    if (!this.place) return;

    const status = this.place.active ? false : true;
    const action = this.place.active ? 'Suspend' : 'Reinstate';

    this.confirmationService.confirmSuspend(this.place.placeName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const changes = { active: status };
          this.placeService.update(this.place!.placeId, changes).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success(`Place ${action}ed successfully`, 'Success');

                // Update local state
                if (this.place) {
                  this.place = { ...this.place, active: status };
                }

                this.store.dispatch(PlaceActions.update({
                  place: {
                    id: this.place!.placeId,
                    changes: changes
                  }
                }));
              }
            },
            error: (error) => {
              console.error(error);
            }
          })
        }
      });
  }

  onRestore() {
    if (!this.place) return;

    this.confirmationService.confirmRestore(this.place.placeName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.placeService.restore(this.place!.placeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Place restored successfully', 'Success');
                this.store.dispatch(PlaceActions.update({
                  place: {
                    id: this.place!.placeId,
                    changes: { deleted: false }
                  }
                }));
                this.loadPlaceDetails(this.placeId);
              }
            },
            error: (error) => {
              console.error(error);
            }
          })
        }
      });
  }
}
