import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostOfficeModel } from '../../../core/_state/post-office/post-office.model';
import { PostOfficeService } from '../../../core/_state/post-office/post-office.service';
import { Store } from '@ngrx/store';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { MaterialModule } from '../../../material.module';
import { CountryModel, DivisionOneModel, DivisionTwoModel, DivisionThreeModel } from '../../../core/_state/country/country.model';
import { CountryService } from '../../../core/_state/country/country.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { switchMap, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-add-edit-post-office',
  imports: [MaterialModule],
  templateUrl: './add-edit-post-office.html',
  styleUrl: './add-edit-post-office.css',
})
export class AddEditPostOffice implements OnInit {
  form!: FormGroup;
  postOffice !: PostOfficeModel;
  isSubmitting = false;
  countryList: CountryModel[] = [];
  filteredCountryList: CountryModel[] = [];
  selectedCountryName: string = '';
  divisionOneList: DivisionOneModel[] = [];
  filteredDivOneList: DivisionOneModel[] = [];
  selectedDivOneName: string = '';

  divisionTwoList: DivisionTwoModel[] = [];
  filteredDivTwoList: DivisionTwoModel[] = [];
  selectedDivTwoName: string = '';

  divisionThreeList: DivisionThreeModel[] = [];
  filteredDivThreeList: DivisionThreeModel[] = [];
  selectedDivThreeName: string = '';

  divOneLabel: string | null = null;
  divTwoLabel: string | null = null;
  divThreeLabel: string | null = null;

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

  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  isEditMode = false;
  postOfficeId!: number;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private encryptionService: EncryptionService,
    private fb: FormBuilder,
    private store: Store,
    private postOfficeService: PostOfficeService,
    private utilityService: UtilityService,
    private toastService: ToastService,
    private countryService: CountryService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService
  ) { }



  ngOnInit() {
    this.searchCountrySubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchCountryText = searchText;
      this.countryPage = 1;
      this.countryList = [];
      this.getCountries();
    });

    this.searchDivOneSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchDivOneText = searchText;
      if (this.form.value.countryId) {
        this.divOnePage = 1;
        this.divisionOneList = [];
        this.fetchDivisionOne(this.form.value.countryId);
      }
    });

    this.searchDivTwoSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchDivTwoText = searchText;
      if (this.form.value.divOneId) {
        this.divTwoPage = 1;
        this.divisionTwoList = [];
        this.fetchDivisionTwo(this.form.value.divOneId);
      }
    });

    this.searchDivThreeSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchDivThreeText = searchText;
      if (this.form.value.divTwoId) {
        this.divThreePage = 1;
        this.divisionThreeList = [];
        this.fetchDivisionThree(this.form.value.divTwoId);
      }
    });

    this.formInItialize();
    this.getCountries();

    this.route.params.pipe(
      switchMap(params => {
        if (params['id']) {
          const decryptedId = this.encryptionService.decryptFromRoute(params['id']);
          if (decryptedId) {
            this.isEditMode = true;
            this.postOfficeId = +decryptedId;
            return this.postOfficeService.getById(this.postOfficeId);
          } else {
            this.toastService.error('Invalid Post Office ID', 'Error');
            this.goBack();
            return of(null);
          }
        }
        return of(null);
      })
    ).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.patchForm(response.data);
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  patchForm(data: PostOfficeModel) {
    this.postOffice = data;
    const formData = {
      ...data,
      zipCodes: data.zipCodes.map(z => ({
        zipCode: z.zipCode,
        zipCodeId: z.zipCodeId,
        deleted: z.deleted,
        active: z.active
      }))
    };
    this.form.patchValue(formData);

    // Attempt to set labels if countryList is already loaded
    if (this.countryList.length > 0) {
      this.setInitialDropdownState(data);
    }
  }

  setInitialDropdownState(data: PostOfficeModel) {
    if (data.countryId) {
      const country = this.countryList.find(c => c.countryId == data.countryId);
      if (country) {
        this.selectedCountryName = country.countryName;
      }
      this.updateDivisionLabels(data.countryId);
      this.loadDivisionsForEdit(data);
    }
  }

  formInItialize() {
    this.form = this.fb.group({
      postOfficeName: ['', Validators.required],
      countryId: ['', Validators.required],
      divOneId: [0],
      divTwoId: [0],
      divThreeId: [0],
      zipCodes: [[], Validators.required],
    });
  }

  goBack() {
    this.location.back();
  }

  getCountries() {
    let params: any = { PageNumber: this.countryPage, Limit: this.lookupLimit };
    if (this.searchCountryText) {
      params.SearchText = this.searchCountryText;
    }
    this.countryService.lookup(params).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          const items = res.data.items || res.data;
          this.countryList = [...this.countryList, ...items];
          this.countryList = Array.from(new Map(this.countryList.map(item => [item.countryId, item])).values());
          this.filteredCountryList = [...this.countryList];
          this.countryTotalPages = res.data.totalPages || 1;

          if (this.isEditMode && this.postOffice) {
            this.setInitialDropdownState(this.postOffice);
          }
        }
      },
      error: (error) => {
        console.log("error", error);
      }
    })
  }

  onPrevCountryPage(event: Event) {
    event.stopPropagation();
    if (this.countryPage > 1) {
      this.countryPage--;
      this.countryList = [];
      this.getCountries();
    }
  }

  onNextCountryPage(event: Event) {
    event.stopPropagation();
    if (this.countryPage < this.countryTotalPages) {
      this.countryPage++;
      this.countryList = [];
      this.getCountries();
    }
  }

  loadDivisionsForEdit(data: any) {
    console.log("data", data);

    if (data.countryId) {
      this.countryService.getDivisionOneLookup({ CountryId: data.countryId }).subscribe((res: any) => {
        if (res && res.data) {
          console.log("res", res);

          this.divisionOneList = res.data.items;
          this.filteredDivOneList = [...this.divisionOneList];
          if (data.divOneId) {
            const div = this.divisionOneList.find(d => d.divOneId == data.divOneId);
            if (div) this.selectedDivOneName = div.divOneName;
          }
        }
      });
    }
    if (data.divOneId) {
      this.countryService.getDivisionTwoLookup({ DivisionOneId: data.divOneId }).subscribe((res: any) => {
        if (res && res.data) {
          this.divisionTwoList = res.data.items;
          this.filteredDivTwoList = [...this.divisionTwoList];
          if (data.divTwoId) {
            const div = this.divisionTwoList.find(d => d.divTwoId == data.divTwoId);
            if (div) this.selectedDivTwoName = div.divTwoName;
          }
        }
      });
    }
    if (data.divTwoId) {
      this.countryService.getDivisionThreeLookup({ DivisionTwoId: data.divTwoId }).subscribe((res: any) => {
        if (res && res.data) {
          this.divisionThreeList = res.data.items;
          this.filteredDivThreeList = [...this.divisionThreeList];
          if (data.divThreeId) {
            const div = this.divisionThreeList.find(d => d.divThreeId == data.divThreeId);
            if (div) this.selectedDivThreeName = div.divThreeName;
          }
        }
      });
    }
  }

  onCountrySearch(event: any) {
    const searchText = event.target.value.toLowerCase();
    this.filteredCountryList = this.countryList.filter(c =>
      c.countryName.toLowerCase().includes(searchText)
    );
  }

  selectCountry(country: CountryModel) {
    this.selectedCountryName = country.countryName;
    this.form.patchValue({ countryId: country.countryId });
    // Need to trigger the change using the exact format expected by onCountryChange
    this.onCountryChange({ target: { value: country.countryId } });
  }

  onCountryChange(event: any) {
    const countryId = event.target.value;

    this.updateDivisionLabels(countryId);

    // Reset downstream fields
    this.form.patchValue({
      divOneId: 0,
      divTwoId: 0,
      divThreeId: 0
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
      this.fetchDivisionOne(this.form.value.countryId);
    }
  }

  onNextDivOnePage(event: Event) {
    event.stopPropagation();
    if (this.divOnePage < this.divOneTotalPages) {
      this.divOnePage++;
      this.divisionOneList = [];
      this.fetchDivisionOne(this.form.value.countryId);
    }
  }

  onDivisionOneChange(event: any) {
    const divisionOneId = event.target.value;

    this.form.patchValue({
      divTwoId: 0,
      divThreeId: 0
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
      this.fetchDivisionTwo(this.form.value.divOneId);
    }
  }

  onNextDivTwoPage(event: Event) {
    event.stopPropagation();
    if (this.divTwoPage < this.divTwoTotalPages) {
      this.divTwoPage++;
      this.divisionTwoList = [];
      this.fetchDivisionTwo(this.form.value.divOneId);
    }
  }

  onDivisionTwoChange(event: any) {
    const divisionTwoId = event.target.value;

    this.form.patchValue({
      divThreeId: 0
    });
    this.divisionThreeList = [];
    this.filteredDivThreeList = [];
    this.selectedDivThreeName = '';
    this.searchDivThreeText = '';
    this.divThreePage = 1;

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
      this.fetchDivisionThree(this.form.value.divTwoId);
    }
  }

  onNextDivThreePage(event: Event) {
    event.stopPropagation();
    if (this.divThreePage < this.divThreeTotalPages) {
      this.divThreePage++;
      this.divisionThreeList = [];
      this.fetchDivisionThree(this.form.value.divTwoId);
    }
  }

  onDivisionThreeChange(event: any) {
    // No downstream lists to fetch at division three
  }

  onDivOneSearch(event: any) {
    this.searchDivOneSubject.next(event.target.value);
  }

  selectDivOne(division: DivisionOneModel) {
    this.selectedDivOneName = division.divOneName;
    this.form.patchValue({ divOneId: division.divOneId });
    this.onDivisionOneChange({ target: { value: division.divOneId } });
  }

  onDivTwoSearch(event: any) {
    this.searchDivTwoSubject.next(event.target.value);
  }

  selectDivTwo(division: DivisionTwoModel) {
    this.selectedDivTwoName = division.divTwoName;
    this.form.patchValue({ divTwoId: division.divTwoId });
    this.onDivisionTwoChange({ target: { value: division.divTwoId } });
  }

  onDivThreeSearch(event: any) {
    this.searchDivThreeSubject.next(event.target.value);
  }

  selectDivThree(division: DivisionThreeModel) {
    this.selectedDivThreeName = division.divThreeName;
    this.form.patchValue({ divThreeId: division.divThreeId });
    this.onDivisionThreeChange({ target: { value: division.divThreeId } });
  }

  updateDivisionLabels(countryId: any) {
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

    this.updateValidator('divOneId', this.divOneLabel);
    this.updateValidator('divTwoId', this.divTwoLabel);
    this.updateValidator('divThreeId', this.divThreeLabel);
  }

  updateValidator(controlName: string, label: string | null) {
    const control = this.form.get(controlName);
    if (!label) {
      control?.clearValidators();
      control?.setValue(0); // Start clean if hidden
      control?.updateValueAndValidity();
    }
  }


  // Chip input handlers
  addZip(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our zip
    if (value) {
      const currentZips = this.form.get('zipCodes')?.value || [];
      // Optional: Check duplicates
      const exists = currentZips.some((z: any) => z.zipCode === value);
      if (!exists) {
        const updatedZips = [...currentZips, { zipCode: value, zipCodeId: 0, deleted: false, active: true }];
        this.form.get('zipCodes')?.setValue(updatedZips);
        this.form.get('zipCodes')?.updateValueAndValidity();
      }
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeZip(zip: any): void {
    const currentZips = this.form.get('zipCodes')?.value || [];
    const index = currentZips.findIndex((z: any) => z.zipCode === zip.zipCode);

    if (index < 0) {
      return;
    }

    // If editing an existing post office and this zip exists on the server,
    // call the deleteZipcode API with its id. Otherwise just remove locally.
    if (zip.zipCodeId && zip.zipCodeId !== 0) {
      this.confirmationService.confirmDelete(`Zip code ${zip.zipCode}`).subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        this.postOfficeService.deleteZipcode(zip.zipCodeId).subscribe({
          next: (res) => {
            if ((res as any).statusCode === 200) {
              // Don't remove from list, just mark as deleted so it shows the restore button
              const updatedZips = [...currentZips];
              updatedZips[index] = { ...updatedZips[index], deleted: true, active: false };
              this.form.get('zipCodes')?.setValue(updatedZips);
              this.form.get('zipCodes')?.updateValueAndValidity();

              this.toastService.success('Zip code removed successfully', 'Success');
            } else {
              this.toastService.error((res as any).message || 'Failed to remove zip code', 'Failed');
            }
          },
          error: () => {

          }
        });
      });
    } else {
      const updatedZips = [...currentZips];
      updatedZips.splice(index, 1);
      this.form.get('zipCodes')?.setValue(updatedZips);
      this.form.get('zipCodes')?.updateValueAndValidity();
    }
  }

  restoreZip(zip: any): void {
    this.confirmationService.confirmRestore(zip.zipCode, `Do you want to restore zip code ${zip.zipCode}?`).subscribe(confirmed => {
      if (confirmed) {
        this.postOfficeService.restoreZipcode(zip.zipCodeId).subscribe({
          next: (res) => {
            if (res.statusCode === 200) {
              const currentZips = this.form.get('zipCodes')?.value || [];
              const updatedZips = currentZips.map((z: any) => {
                if (z.zipCodeId === zip.zipCodeId) {
                  return { ...z, deleted: false, active: true };
                }
                return z;
              });
              this.form.get('zipCodes')?.setValue(updatedZips);
              this.toastService.success('Zip code restored successfully', 'Success');
            }
          },
          error: (err) => {
            console.log("error", err);
          }
        });
      }
    });
  }

  // Form submit function
  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      console.log('Form Data:', this.form.value);
      if (this.isEditMode) {
        this.updatePostOffice();
      } else {
        this.addPostOffice();
      }
    }


  }

  addPostOffice() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const newPostOffice = {
        postOfficeName: formValue.postOfficeName,
        countryId: formValue.countryId,
        divOneId: formValue.divOneId || 0,
        divTwoId: formValue.divTwoId || 0,
        divThreeId: formValue.divThreeId || 0,
        zipCodes: (formValue.zipCodes || []).map((z: any) => z.zipCode),
      }
      console.log("payload", newPostOffice);
      this.postOfficeService.create(newPostOffice).subscribe({
        next: (res) => {
          console.log("response", res);
          if (res.statusCode === 201) {
            this.toastService.success('Post Office added successfully', 'Success');
            this.goBack();
          }
          else {
            this.toastService.error(res.message, 'Failed');
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          this.isSubmitting = false;
          if (error.error.statusCode === 422) {
            const existingId = error.error.data?.postOfficeId;
            if (existingId) {
              this.restorePostOffice(existingId, newPostOffice.postOfficeName);
            }
          }
        }
      })
    }
  }

  updatePostOffice() {
    if (this.form.valid && this.postOffice) {
      const changes = this.getChangedValues(this.form.value, this.postOffice);

      if (Object.keys(changes).length === 0) {
        this.toastService.info('No changes detected', 'Info');
        this.isSubmitting = false;
        return;
      }

      console.log("payload", changes);
      this.postOfficeService.update(this.postOfficeId, changes).subscribe({
        next: (res) => {
          console.log("response", res);
          if (res.statusCode === 200) {
            this.toastService.success('Post Office updated successfully', 'Success');
            this.goBack();
          }
          else {
            this.toastService.error(res.message, 'Failed');
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          this.isSubmitting = false;
        }
      })
    }
  }

  restorePostOffice(id: number, name: string) {
    this.confirmationService.confirmRestore(name, `${name} already available, do you want to restore?`).subscribe(confirmed => {
      if (confirmed) {
        this.postOfficeService.restore(id).subscribe({
          next: (restoreRes) => {
            if (restoreRes.statusCode === 200) {
              this.toastService.success('Post Office restored successfully', 'Success');
              this.goBack();
            }
          },
          error: (err) => {
            console.log("error", err);
          }
        });
      }
    });
  }

  getChangedValues(formValue: any, originalData: any): any {
    const changes: any = {};

    if (formValue.postOfficeName !== originalData.postOfficeName) {
      changes.postOfficeName = formValue.postOfficeName;
    }

    if (formValue.countryId !== originalData.countryId) {
      changes.countryId = formValue.countryId;
    }

    if ((formValue.divOneId || 0) !== (originalData.divOneId || 0)) {
      changes.divOneId = formValue.divOneId || 0;
    }

    if ((formValue.divTwoId || 0) !== (originalData.divTwoId || 0)) {
      changes.divTwoId = formValue.divTwoId || 0;
    }

    if ((formValue.divThreeId || 0) !== (originalData.divThreeId || 0)) {
      changes.divThreeId = formValue.divThreeId || 0;
    }

    // Zip codes handling:
    const formZips = formValue.zipCodes || [];
    const addedZips = formZips.filter((z: any) => z.zipCodeId === 0);

    if (addedZips.length > 0) {
      changes.addZipCodes = addedZips.map((z: any) => z.zipCode);
    }

    // We only update changes if the updateZipCodes pattern is needed instead of independent API calls.
    // If you ever populate updateZipCodes locally before saving, add it logic here.
    return changes;
  }

  // Utility to mark all fields as touched to trigger validation messages
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control); // Recursively check nested form groups
      }
    });
  }

  // Utility function to easily access form control status for display
  get f() {
    return this.form.controls;
  }

  get title(): string {
    return this.isEditMode ? 'Edit Post Office' : 'Add Post Office';
  }
}
