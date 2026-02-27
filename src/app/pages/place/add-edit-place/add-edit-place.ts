import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaceService } from '../../../core/_state/place/place.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { PlaceModel } from '../../../core/_state/place/place.model';
import { forkJoin, of, switchMap, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CountryService } from '../../../core/_state/country/country.service';
import { CountryModel, DivisionOneModel, DivisionThreeModel, DivisionTwoModel } from '../../../core/_state/country/country.model';
import { PostOfficeService } from '../../../core/_state/post-office/post-office.service';
import { PostOfficeModel } from '../../../core/_state/post-office/post-office.model';

@Component({
  selector: 'app-add-edit-place',
  imports: [CommonModule, MaterialModule],
  templateUrl: './add-edit-place.html',
  styleUrl: './add-edit-place.css',
})
export class AddEditPlace implements OnInit {
  form!: FormGroup;
  filterForm!: FormGroup;
  isEditMode = false;
  placeId!: number;
  submitting = false;
  originalData!: PlaceModel;


  countryList: CountryModel[] = [];
  divisionOneList: DivisionOneModel[] = [];
  divisionTwoList: DivisionTwoModel[] = [];
  divisionThreeList: DivisionThreeModel[] = [];

  postOfficeList: PostOfficeModel[] = [];

  divOneLabel: string | null = null;
  divTwoLabel: string | null = null;
  divThreeLabel: string | null = null;

  selectedZipCodes: any[] = [];

  isLocationPanelOpen = false;

  selectedCountryName: string = '';
  filteredCountryList: CountryModel[] = [];

  selectedDivOneName: string = '';
  filteredDivOneList: DivisionOneModel[] = [];

  selectedDivTwoName: string = '';
  filteredDivTwoList: DivisionTwoModel[] = [];

  selectedDivThreeName: string = '';
  filteredDivThreeList: DivisionThreeModel[] = [];

  searchCountryText: string = '';
  searchCountrySubject = new Subject<string>();

  searchDivOneText: string = '';
  searchDivOneSubject = new Subject<string>();

  searchDivTwoText: string = '';
  searchDivTwoSubject = new Subject<string>();

  searchDivThreeText: string = '';
  searchDivThreeSubject = new Subject<string>();

  countryPage = 1;
  countryTotalPages = 1;

  divOnePage = 1;
  divOneTotalPages = 1;

  divTwoPage = 1;
  divTwoTotalPages = 1;

  divThreePage = 1;
  divThreeTotalPages = 1;

  lookupLimit = 10;

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private placeService: PlaceService,
    private countryService: CountryService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private encryptionService: EncryptionService,
    private postOfficeService: PostOfficeService
  ) { }

  ngOnInit(): void {
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
      if (this.filterForm.value.countryId) {
        this.divOnePage = 1;
        this.divisionOneList = [];
        this.fetchDivisionOne(this.filterForm.value.countryId);
      }
    });

    this.searchDivTwoSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchDivTwoText = searchText;
      if (this.filterForm.value.divOneId) {
        this.divTwoPage = 1;
        this.divisionTwoList = [];
        this.fetchDivisionTwo(this.filterForm.value.divOneId);
      }
    });

    this.searchDivThreeSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchDivThreeText = searchText;
      if (this.filterForm.value.divTwoId) {
        this.divThreePage = 1;
        this.divisionThreeList = [];
        this.fetchDivisionThree(this.filterForm.value.divTwoId);
      }
    });

    this.loadCountryLookup();
    this.formInItialize();
    this.loadData();
  }

  formInItialize() {
    this.form = this.fb.group({
      placeName: ['', Validators.required],
      zipCodeLinkIds: [[], Validators.required]
    });

    this.filterForm = this.fb.group({
      countryId: [''],
      divOneId: [''],
      divTwoId: [''],
      divThreeId: ['']
    });
  }

  zipCodeList: any[] = [];

  loadData() {
    this.route.params.pipe(
      switchMap(params => {
        if (params['id']) {
          const decryptedId = this.encryptionService.decryptFromRoute(params['id']);
          if (decryptedId) {
            this.isEditMode = true;
            this.placeId = +decryptedId;
            return this.placeService.getById(this.placeId);
          } else {
            this.toastService.error('Invalid Place ID', 'Error');
            this.goBack();
            return of(null);
          }
        }
        return of(null);
      })
    ).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.originalData = response.data;
          console.log("Original Data", this.originalData);

          this.patchForm(response.data);
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  loadCountryLookup() {
    let params: any = { PageNumber: this.countryPage, Limit: this.lookupLimit };
    if (this.searchCountryText) {
      params.SearchText = this.searchCountryText;
    }
    this.countryService.lookup(params).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          const items = response.data.items || response.data;
          this.countryList = [...this.countryList, ...items];
          // Remove duplicates 
          this.countryList = Array.from(new Map(this.countryList.map(item => [item.countryId, item])).values());
          this.filteredCountryList = [...this.countryList];
          this.countryTotalPages = response.data.totalPages || 1;
          console.log("Country List", this.countryList);

          // If in edit mode and form is patched, we might need to update labels now
          // or rely on patchForm to trigger it if we call updateDivisionLabels there.
          // Since patchForm runs when loadData returns, and loadData might return before this,
          // let's just check the form value.
          const currentCountryId = this.form.get('countryId')?.value;
          if (currentCountryId) {
            this.updateDivisionLabels(currentCountryId);
          }
        }
      },
      error: (error) => {
        console.error(error);
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

  onCountryChange(event: any) {
    const countryId = event.target.value;

    this.updateDivisionLabels(countryId);

    // Reset downstream fields
    this.filterForm.patchValue({
      divOneId: '',
      divTwoId: '',
      divThreeId: ''
    });
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

    this.postOfficeList = [];

    this.getPostOffices();

    this.fetchDivisionOne(countryId);
  }

  fetchDivisionOne(countryId: any) {
    let params: any = { CountryId: countryId, PageNumber: this.divOnePage, Limit: this.lookupLimit };
    if (this.searchDivOneText) {
      params.SearchText = this.searchDivOneText;
    }
    this.countryService.getDivisionOneLookup(params).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          const items = response.data.items || response.data;
          this.divisionOneList = [...this.divisionOneList, ...items];
          this.divisionOneList = Array.from(new Map(this.divisionOneList.map(item => [item.divOneId, item])).values());
          this.filteredDivOneList = [...this.divisionOneList];
          this.divOneTotalPages = response.data.totalPages || 1;
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  onPrevDivOnePage(event: Event) {
    event.stopPropagation();
    if (this.divOnePage > 1) {
      this.divOnePage--;
      this.divisionOneList = [];
      this.fetchDivisionOne(this.filterForm.value.countryId);
    }
  }

  onNextDivOnePage(event: Event) {
    event.stopPropagation();
    if (this.divOnePage < this.divOneTotalPages) {
      this.divOnePage++;
      this.divisionOneList = [];
      this.fetchDivisionOne(this.filterForm.value.countryId);
    }
  }

  onCountrySearch(event: any) {
    this.searchCountrySubject.next(event.target.value);
  }

  selectCountry(country: CountryModel) {
    this.selectedCountryName = country.countryName;
    this.filterForm.patchValue({ countryId: country.countryId });
    this.onCountryChange({ target: { value: country.countryId } });
  }

  onDivisionOneChange(event: any) {
    const divisionOneId = event.target.value;

    // Reset downstream fields
    this.filterForm.patchValue({
      divTwoId: '',
      divThreeId: ''
    });
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

    this.getPostOffices();

    this.fetchDivisionTwo(divisionOneId);
  }

  fetchDivisionTwo(divisionOneId: any) {
    let params: any = { DivisionOneId: divisionOneId, PageNumber: this.divTwoPage, Limit: this.lookupLimit };
    if (this.searchDivTwoText) {
      params.SearchText = this.searchDivTwoText;
    }
    this.countryService.getDivisionTwoLookup(params).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          const items = response.data.items || response.data;
          this.divisionTwoList = [...this.divisionTwoList, ...items];
          this.divisionTwoList = Array.from(new Map(this.divisionTwoList.map(item => [item.divTwoId, item])).values());
          this.filteredDivTwoList = [...this.divisionTwoList];
          this.divTwoTotalPages = response.data.totalPages || 1;
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  onPrevDivTwoPage(event: Event) {
    event.stopPropagation();
    if (this.divTwoPage > 1) {
      this.divTwoPage--;
      this.divisionTwoList = [];
      this.fetchDivisionTwo(this.filterForm.value.divOneId);
    }
  }

  onNextDivTwoPage(event: Event) {
    event.stopPropagation();
    if (this.divTwoPage < this.divTwoTotalPages) {
      this.divTwoPage++;
      this.divisionTwoList = [];
      this.fetchDivisionTwo(this.filterForm.value.divOneId);
    }
  }

  onDivisionTwoChange(event: any) {
    const divisionTwoId = event.target.value;

    // Reset downstream fields
    this.filterForm.patchValue({
      divThreeId: ''
    });
    this.divisionThreeList = [];
    this.filteredDivThreeList = [];
    this.selectedDivThreeName = '';
    this.searchDivThreeText = '';
    this.divThreePage = 1;

    this.getPostOffices();

    this.fetchDivisionThree(divisionTwoId);
  }

  fetchDivisionThree(divisionTwoId: any) {
    let params: any = { DivisionTwoId: divisionTwoId, PageNumber: this.divThreePage, Limit: this.lookupLimit };
    if (this.searchDivThreeText) {
      params.SearchText = this.searchDivThreeText;
    }
    this.countryService.getDivisionThreeLookup(params).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          const items = response.data.items || response.data;
          this.divisionThreeList = [...this.divisionThreeList, ...items];
          this.divisionThreeList = Array.from(new Map(this.divisionThreeList.map(item => [item.divThreeId, item])).values());
          this.filteredDivThreeList = [...this.divisionThreeList];
          this.divThreeTotalPages = response.data.totalPages || 1;
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  onPrevDivThreePage(event: Event) {
    event.stopPropagation();
    if (this.divThreePage > 1) {
      this.divThreePage--;
      this.divisionThreeList = [];
      this.fetchDivisionThree(this.filterForm.value.divTwoId);
    }
  }

  onNextDivThreePage(event: Event) {
    event.stopPropagation();
    if (this.divThreePage < this.divThreeTotalPages) {
      this.divThreePage++;
      this.divisionThreeList = [];
      this.fetchDivisionThree(this.filterForm.value.divTwoId);
    }
  }

  onDivisionThreeChange(event: any) {
    this.getPostOffices();
  }

  onDivOneSearch(event: any) {
    this.searchDivOneSubject.next(event.target.value);
  }

  selectDivOne(division: DivisionOneModel) {
    this.selectedDivOneName = division.divOneName;
    this.filterForm.patchValue({ divOneId: division.divOneId });
    this.onDivisionOneChange({ target: { value: division.divOneId } });
  }

  onDivTwoSearch(event: any) {
    this.searchDivTwoSubject.next(event.target.value);
  }

  selectDivTwo(division: DivisionTwoModel) {
    this.selectedDivTwoName = division.divTwoName;
    this.filterForm.patchValue({ divTwoId: division.divTwoId });
    this.onDivisionTwoChange({ target: { value: division.divTwoId } });
  }

  onDivThreeSearch(event: any) {
    this.searchDivThreeSubject.next(event.target.value);
  }

  selectDivThree(division: DivisionThreeModel) {
    this.selectedDivThreeName = division.divThreeName;
    this.filterForm.patchValue({ divThreeId: division.divThreeId });
    this.onDivisionThreeChange({ target: { value: division.divThreeId } });
  }

  shouldFetchPostOffices(): boolean {
    const { countryId, divOneId, divTwoId, divThreeId } = this.filterForm.value;
    if (!countryId) return false;

    let totalDivisions = 0;
    if (this.divOneLabel) totalDivisions++;
    if (this.divTwoLabel) totalDivisions++;
    if (this.divThreeLabel) totalDivisions++;

    if (totalDivisions === 3) {
      return !!divThreeId; // fetch on third division
    } else if (totalDivisions === 2) {
      return !!divTwoId; // fetch on second division
    } else if (totalDivisions === 1) {
      return !!divOneId; // fetch on first division
    }
    else if (totalDivisions === 0) {
      return !!countryId; // fetch on country
    }

    return false;
  }

  getPostOffices() {
    if (!this.shouldFetchPostOffices()) {
      this.postOfficeList = [];
      return;
    }

    const { countryId, divOneId, divTwoId, divThreeId } = this.filterForm.value;
    const params: any = {};

    if (countryId) params.CountryId = countryId;
    if (divOneId) params.DivOneId = divOneId;
    if (divTwoId) params.DivTwoId = divTwoId;
    if (divThreeId) params.DivThreeId = divThreeId;

    this.postOfficeService.lookup(params).subscribe({
      next: (response: any) => {
        console.log("Post Office -list", response);

        this.postOfficeList = response.items || [];
      },
      error: (error) => {
        console.error(error);
        this.postOfficeList = [];
      }
    });
  }

  toggleZipSelection(event: any, zipObj: any, postOffice: any) {
    const checked = event.target.checked;
    const normalizedZipId = zipObj.zipCodeId || zipObj.zipCodeLinkId || zipObj.id;

    if (checked) {
      if (!this.selectedZipCodes.some((z: any) => z.zipCodeId == normalizedZipId)) {
        const locationString = this.generateLocationStringForPO(postOffice);
        this.selectedZipCodes.push({
          ...zipObj,
          zipCodeId: normalizedZipId,
          location: locationString
        });
        this.updateZipCodeIds();
      }
    } else {
      this.selectedZipCodes = this.selectedZipCodes.filter((z: any) => z.zipCodeId != normalizedZipId);
      this.updateZipCodeIds();
    }
  }

  isZipSelected(zipObj: any): boolean {
    const normalizedZipId = zipObj.zipCodeId || zipObj.zipCodeLinkId || zipObj.id;
    return this.selectedZipCodes.some(z => z.zipCodeId == normalizedZipId);
  }

  generateLocationStringForPO(postOffice: any): string {
    const { countryId, divOneId, divTwoId, divThreeId } = this.filterForm.value;

    const findName = (list: any[], id: any, idKey: string, nameKey: string) => {
      if (!id) return null;
      const item = list.find(x => x[idKey] == id);
      return item ? item[nameKey] : null;
    };

    const parts = [
      findName(this.countryList, countryId, 'countryId', 'countryName'),
      findName(this.divisionOneList, divOneId, 'divOneId', 'divOneName'),
      findName(this.divisionTwoList, divTwoId, 'divTwoId', 'divTwoName'),
      findName(this.divisionThreeList, divThreeId, 'divThreeId', 'divThreeName'),
      postOffice.postOfficeName
    ];

    return parts.filter(p => !!p).join(' - ');
  }

  removeZipCode(index: number) {
    this.selectedZipCodes.splice(index, 1);
    this.updateZipCodeIds();
  }

  updateZipCodeIds() {
    // Ensure IDs are strings as required by the backend
    const ids = this.selectedZipCodes.map(z => String(z.zipCodeId));
    this.form.patchValue({ zipCodeLinkIds: ids });
  }

  patchForm(data: any) {
    this.form.patchValue({
      placeName: data.placeName
    });

    this.selectedZipCodes = [];

    // Try to build from postOffices first as it has hierarchy info
    if (data.postOffices && data.postOffices.length > 0) {
      data.postOffices.forEach((po: any) => {
        // Build location string for this PO
        const locationParts = [
          po.countryName,
          po.divisionOneName,
          po.divisionTwoName,
          po.divisionThreeName,
          po.postOfficeName
        ].filter(p => !!p);

        const locationString = locationParts.join(' | ');

        if (po.zipCodes && po.zipCodes.length > 0) {
          po.zipCodes.forEach((link: any) => {
            if (link.active !== false) {
              this.selectedZipCodes.push({
                ...link,
                zipCodeId: link.zipCodeLinkId || link.zipCodeId,
                location: locationString
              });
            }
          });
        }
      });
    } else if (data.zipCodes && data.zipCodes.length > 0) {
      // Fallback if postOffices not available or empty structure
      data.zipCodes.forEach((link: any) => {
        if (link.active !== false) {
          this.selectedZipCodes.push({
            ...link,
            zipCodeId: link.zipCodeLinkId || link.zipCodeId // Handle both cases
          });
        }
      });
    }

    this.updateZipCodeIds();
  }

  goBack() {
    this.location.back();
  }

  get title(): string {
    return this.isEditMode ? 'Edit Place' : 'Add Place';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.toastService.error('Please fill all the required fields', 'Error');
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    if (this.isEditMode) {
      this.editPlace();
    } else {
      this.addPlace();
    }
  }

  addPlace() {
    if (this.form.valid) {
      const payload = {
        placeName: this.form.value.placeName,
        zipCodeLinkIds: this.form.value.zipCodeLinkIds
      };

      console.log(payload);


      this.placeService.create(payload).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.statusCode === 201) {
            this.toastService.success('Place created successfully', 'Success');

          } else {
            this.toastService.error(res.message || 'Operation failed', 'Error');
          }
        },
        error: (error) => {
          this.submitting = false;
        }
      });
    }
  }

  editPlace() {
    if (this.form.valid) {
      // For edit, we might need a more complex diff, but basic payload is mostly replacing lists
      // If the backend expects full replacement of zipCodeLinkIds, we send the current list.
      // If it expects diffs, that's harder. Assuming standard "update with full state" or similar.
      // Current usage suggests update takes "changes".

      const changes = this.getChangedValues(this.form.value, this.originalData);

      if (Object.keys(changes).length === 0) {
        this.toastService.info('No changes detected', 'Info');
        this.submitting = false;
        return;
      }

      console.log("Payload", changes);


      this.placeService.update(this.placeId, changes).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.statusCode === 200) {
            this.toastService.success('Place updated successfully', 'Success');
            const id = this.encryptionService.encrypt(res.data.placeId);
            this.router.navigate(['/place/details/', id]);
          } else {
            this.toastService.error(res.message || 'Operation failed', 'Error');
          }
        },
        error: (error) => {
          this.submitting = false;
        }
      });
    }
  }

  getChangedValues(formValue: any, originalData: PlaceModel): any {
    const changes: any = {};

    if (formValue.placeName !== originalData.placeName) {
      changes.placeName = formValue.placeName;
    }

    const currentIds = (formValue.zipCodeLinkIds || []).map((id: any) => Number(id));

    const originalLinks: any[] = [];
    if (originalData.postOffices && originalData.postOffices.length > 0) {
      originalData.postOffices.forEach(po => {
        if (po.zipCodes) {
          originalLinks.push(...po.zipCodes);
        }
      });
    } else if (originalData.zipCodes && originalData.zipCodes.length > 0) {
      originalLinks.push(...originalData.zipCodes);
    }

    const originalMap = new Map<number, any>();
    originalLinks.forEach(link => {
      const key = link.zipCodeLinkId;
      if (!originalMap.has(key)) {
        originalMap.set(key, link);
      }
    });

    const insertZipCodeLinkIds: number[] = [];
    const updateZipCodeLinkIds: any[] = [];

    currentIds.forEach((id: number) => {
      const originalLink = originalMap.get(id);
      if (originalLink) {
        if (originalLink.active === false) {
          updateZipCodeLinkIds.push({
            zipCodeLinkId: originalLink.zipCodeLinkId,
            active: true
          });
        }
      } else {
        insertZipCodeLinkIds.push(id);
      }
    });

    originalMap.forEach((link, id) => {
      if (!currentIds.includes(id)) {
        if (link.active !== false) {
          updateZipCodeLinkIds.push({
            zipCodeLinkId: link.zipCodeLinkId,
            active: false
          });
        }
      }
    });

    if (insertZipCodeLinkIds.length > 0) {
      changes.insertZipCodeLinkIds = insertZipCodeLinkIds;
    }

    if (updateZipCodeLinkIds.length > 0) {
      changes.updateZipCodeLinkIds = updateZipCodeLinkIds;
    }

    return changes;
  }

  updateDivisionLabels(countryId: any) {
    // countryId might be string from select or number from model
    const country = this.countryList.find(c => c.countryId == countryId);
    if (country) {
      this.divOneLabel = country.divisionOne || null;
      this.divTwoLabel = country.divisionTwo || null;
      this.divThreeLabel = country.divisionThree || null;
    } else {
      this.divOneLabel = null;
      this.divTwoLabel = null;
      this.divThreeLabel = null;
    }

    // Update validators based on visibility
    this.updateValidator('divOneId', this.divOneLabel);
    this.updateValidator('divTwoId', this.divTwoLabel);
    this.updateValidator('divThreeId', this.divThreeLabel);
  }

  updateValidator(controlName: string, label: string | null) {
    const control = this.filterForm.get(controlName);
    if (!label) {
      control?.clearValidators();
      control?.setValue(''); // Start clean if hidden
      control?.updateValueAndValidity();
    }
  }

  toggleLocationPanel() {
    this.isLocationPanelOpen = !this.isLocationPanelOpen;
    this.filterForm.reset();
    this.divOneLabel = null;
    this.divTwoLabel = null;
    this.divThreeLabel = null;
  }
}
