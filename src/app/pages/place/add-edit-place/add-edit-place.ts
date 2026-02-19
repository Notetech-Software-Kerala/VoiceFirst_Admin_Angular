import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaceService } from '../../../core/_state/place/place.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { PlaceModel } from '../../../core/_state/place/place.model';
import { forkJoin, of, switchMap } from 'rxjs';
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
      divThreeId: [''],
      postOfficeId: [''],
      selectedZipCodeIds: this.fb.control([])
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
          this.patchForm(response.data);
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  loadCountryLookup() {
    this.countryService.lookup().subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.countryList = response.data;
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

  onCountryChange(event: any) {
    const countryId = event.target.value;

    this.updateDivisionLabels(countryId);

    // Reset downstream fields
    this.filterForm.patchValue({
      divOneId: '',
      divTwoId: '',
      divThreeId: '',
      postOfficeId: '',
      selectedZipCodeIds: []
    });
    this.divisionOneList = [];
    this.divisionTwoList = [];
    this.divisionThreeList = [];
    this.zipCodeList = [];

    this.getPostOffices();

    this.countryService.getDivisionOneLookupByCountryId(countryId).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.divisionOneList = response.data;
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  onDivisionOneChange(event: any) {
    const divisionOneId = event.target.value;

    // Reset downstream fields
    this.filterForm.patchValue({
      divTwoId: '',
      divThreeId: '',
      postOfficeId: '',
      selectedZipCodeIds: []
    });
    this.divisionTwoList = [];
    this.divisionThreeList = [];
    this.zipCodeList = [];

    this.getPostOffices();

    this.countryService.getDivisionTwoLookupByDivisionOneId(divisionOneId).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.divisionTwoList = response.data;
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  onDivisionTwoChange(event: any) {
    const divisionTwoId = event.target.value;

    // Reset downstream fields
    this.filterForm.patchValue({
      divThreeId: '',
      postOfficeId: '',
      selectedZipCodeIds: []
    });
    this.divisionThreeList = [];
    this.zipCodeList = [];

    this.getPostOffices();

    this.countryService.getDivisionThreeLookupByDivisionTwoId(divisionTwoId).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.divisionThreeList = response.data;
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  onDivisionThreeChange(event: any) {
    this.filterForm.patchValue({
      postOfficeId: '',
      selectedZipCodeIds: []
    });
    this.zipCodeList = [];
    this.getPostOffices();
  }

  getPostOffices() {
    const { countryId, divOneId, divTwoId, divThreeId } = this.filterForm.value;
    const params: any = {};

    if (countryId) params.CountryId = countryId;
    if (divOneId) params.DivOneId = divOneId;
    if (divTwoId) params.DivTwoId = divTwoId;
    if (divThreeId) params.DivThreeId = divThreeId;

    this.postOfficeService.lookup(params).subscribe({
      next: (response: any) => {
        // Response is directly the array due to map in service
        this.postOfficeList = response || [];
      },
      error: (error) => {
        console.error(error);
        this.postOfficeList = [];
      }
    });
  }

  onPostOfficeChange(event: any) {
    const postOfficeId = event.target.value;
    this.zipCodeList = [];
    this.filterForm.patchValue({ selectedZipCodeIds: [] });
    // Force reset just in case patch doesn't create it if missing
    if (!this.filterForm.contains('selectedZipCodeIds')) {
      this.filterForm.addControl('selectedZipCodeIds', this.fb.control([]));
    }

    console.log('Post Office Changed:', postOfficeId);

    if (postOfficeId) {
      this.postOfficeService.getZipcodesByPostOfficeIds([postOfficeId]).subscribe({
        next: (zipCodes: any) => {
          // Normalize zip codes to ensure zipCodeId exists
          this.zipCodeList = (zipCodes || []).map((z: any) => ({
            ...z,
            zipCodeId: z.zipCodeId || z.id || z.zipCodeLinkId // Fallback to other possible ID fields
          }));

          if (this.zipCodeList.length > 0) {
            console.log('ZipCode Keys:', Object.keys(this.zipCodeList[0]));
            console.log('Sample ZipCode:', this.zipCodeList[0]);
          }
        },
        error: (err) => console.error(err)
      });
    }
  }

  toggleZipSelection(event: any, zipCodeId: number) {
    const selectedIds = this.filterForm.get('selectedZipCodeIds')?.value || [];
    let newSelectedIds = [...selectedIds];

    if (event.target.checked) {
      if (!newSelectedIds.some((id: any) => id == zipCodeId)) {
        newSelectedIds.push(zipCodeId);
      }
    } else {
      newSelectedIds = newSelectedIds.filter((id: any) => id != zipCodeId);
    }

    console.log('Toggling Zip:', zipCodeId, 'New Selection:', newSelectedIds);
    this.filterForm.patchValue({ selectedZipCodeIds: newSelectedIds });
  }

  isZipSelected(zipCodeId: number): boolean {
    // Check if it's in the temporary selection
    const selectedIds = this.filterForm.get('selectedZipCodeIds')?.value || [];
    if (selectedIds.some((id: any) => id == zipCodeId)) return true;

    // Check if it's already added to the main list
    return this.selectedZipCodes.some(z => z.zipCodeId == zipCodeId);
  }

  addZipCodes() {
    const selectedIds = this.filterForm.get('selectedZipCodeIds')?.value;
    console.log('Selected IDs:', selectedIds);
    console.log('Current ZipCode List:', this.zipCodeList);
    console.log('Already Selected Zips:', this.selectedZipCodes);
    if (!selectedIds || selectedIds.length === 0) return;

    const newZipCodes = this.zipCodeList.filter(z =>
      // Use loose equality or conversion to ensure match
      selectedIds.some((id: any) => id == z.zipCodeId) &&
      !this.selectedZipCodes.some(existing => existing.zipCodeId == z.zipCodeId)
    );

    if (newZipCodes.length > 0) {
      this.selectedZipCodes = [...this.selectedZipCodes, ...newZipCodes];
      this.updateZipCodeIds();
      this.toastService.success(`${newZipCodes.length} Zip Code(s) added`, 'Success');

      // Clear selection
      this.filterForm.patchValue({ selectedZipCodeIds: [] });

      // Manually uncheck inputs
      setTimeout(() => {
        const checkboxes = document.querySelectorAll('.zip-checkbox') as NodeListOf<HTMLInputElement>;
        checkboxes.forEach((cb) => cb.checked = false);
      });
    } else {
      // Check if they were already added
      const duplicates = this.zipCodeList.filter(z =>
        selectedIds.some((id: any) => id == z.zipCodeId) &&
        this.selectedZipCodes.some(existing => existing.zipCodeId == z.zipCodeId)
      );

      if (duplicates.length > 0) {
        this.toastService.info('Selected Zip Codes are already added', 'Info');
      } else {
        // Fallback if filter logic is weird
        this.toastService.warning('Could not add selected Zip Codes', 'Warning');
      }
    }
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

    if (data.zipCodes && data.zipCodes.length > 0) {
      // Map existing links to have zipCodeId property for consistency
      this.selectedZipCodes = data.zipCodes.map((link: any) => ({
        ...link,
        zipCodeId: link.zipCodeLinkId || link.zipCodeId // Handle both cases
      }));
      this.updateZipCodeIds();
    }
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


      // this.placeService.create(payload).subscribe({
      //   next: (res) => {
      //     this.submitting = false;
      //     if (res.statusCode === 201) {
      //       this.toastService.success('Place created successfully', 'Success');

      //     } else {
      //       this.toastService.error(res.message || 'Operation failed', 'Error');
      //     }
      //   },
      //   error: (error) => {
      //     this.submitting = false;
      //   }
      // });
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

      this.placeService.update(this.placeId, changes).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.statusCode === 200) {
            this.toastService.success('Place updated successfully', 'Success');
            this.goBack();
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

    // Compare zipCodeLinkIds arrays
    // currentIds are already strings from updateZipCodeIds
    const currentIds = (formValue.zipCodeLinkIds || []).sort();

    // originalData.zipCodes contains the associated objects. 
    // We need to extract IDs and convert to string for comparison.
    // Note: originalData.postOffices? usage in previous diff was likely incorrect if that field doesn't exist or isn't the zip list.
    // Assuming originalData.zipCodes is the source of truth for existing zips.
    const originalIds = (originalData.zipCodes || [])
      .map((z: any) => String(z.zipCodeId))
      .sort();

    if (JSON.stringify(currentIds) !== JSON.stringify(originalIds)) {
      changes.zipCodeLinkIds = formValue.zipCodeLinkIds;
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
}
