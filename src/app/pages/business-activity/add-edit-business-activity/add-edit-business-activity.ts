import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { BusinessActivityModel } from '../../../core/_state/business-activity/business-activity.model';
import { MaterialModule } from '../../../material.module';
import { BusinessActivityService } from '../../../core/_state/business-activity/business-activity.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { finalize, switchMap, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { CustomFieldModel } from '../../../core/_state/custom-field/custom-field.model';
import { Location, CommonModule } from '@angular/common';
import { CustomFieldService } from '../../../core/_state/custom-field/custom-field.service';

@Component({
  selector: 'app-add-edit-business-activity',
  imports: [MaterialModule, CommonModule],
  templateUrl: './add-edit-business-activity.html',
  styleUrl: './add-edit-business-activity.css',
})
export class AddEditBusinessActivity implements OnInit {
  form!: FormGroup;
  businessActivity!: BusinessActivityModel;
  isSubmitting = false;
  isEditMode = false;
  activityId!: number;

  // Paginated custom fields
  customFieldList: CustomFieldModel[] = [];
  searchCfText: string = '';
  searchSubject = new Subject<string>();
  cfCurrentPage = 1;
  cfPageSize = 10;
  cfTotalCount = 0;
  cfTotalPages = 1;
  private cfPageCache = new Map<string, { items: CustomFieldModel[], totalCount: number, totalPages: number }>();

  // Original linked data (edit mode)
  originalCustomFieldsData: any[] = [];

  constructor(
    private fb: FormBuilder,
    private businessActivityService: BusinessActivityService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private encryptionService: EncryptionService,
    private location: Location,
    private customFieldService: CustomFieldService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.formInitialize();

    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchCfText = searchText;
      this.cfCurrentPage = 1;
      this.cfPageCache.clear();
      this.loadCustomFields();
    });

    this.loadCustomFields();
    this.loadActivityData();
  }

  formInitialize() {
    this.form = this.fb.group({
      activityName: ['', Validators.required],
      active: [true],
      customFieldIds: this.fb.array([])
    });
  }

  loadCustomFields() {
    const cacheKey = `${this.cfCurrentPage}_${this.searchCfText}`;
    const cached = this.cfPageCache.get(cacheKey);
    if (cached) {
      this.customFieldList = cached.items;
      this.cfTotalCount = cached.totalCount;
      this.cfTotalPages = cached.totalPages;
      this.cdr.markForCheck();
      return;
    }

    const params: any = {
      PageNumber: this.cfCurrentPage,
      Limit: this.cfPageSize,
      IsActive: true
    };

    if (this.searchCfText) {
      params.SearchText = this.searchCfText;
    }

    this.customFieldService.getAll(params).subscribe({
      next: (res: any) => {
        const items: CustomFieldModel[] = res?.items || res?.data?.items || [];
        const totalCount: number = res?.totalCount ?? res?.data?.totalCount ?? 0;
        const totalPages: number = res?.totalPages ?? res?.data?.totalPages ?? 1;

        this.cfPageCache.set(cacheKey, { items, totalCount, totalPages });
        this.customFieldList = items;
        this.cfTotalCount = totalCount;
        this.cfTotalPages = totalPages;
        this.cdr.markForCheck();
      },
      error: () => { }
    });
  }

  loadActivityData() {
    this.route.params.pipe(
      switchMap(params => {
        if (params['id']) {
          const decryptedId = this.encryptionService.decryptFromRoute(params['id']);
          if (decryptedId) {
            this.isEditMode = true;
            this.activityId = +decryptedId;
            return this.businessActivityService.getById(this.activityId);
          } else {
            this.toastService.error('Invalid Business Activity ID', 'Error');
            this.goBack();
            return of(null);
          }
        }
        return of(null);
      })
    ).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.businessActivity = response.data;
          this.patchForm(response.data);
          this.cdr.markForCheck();
        }
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  patchForm(data: any) {
    this.form.patchValue({
      activityName: data.activityName,
      active: data.active
    });

    this.originalCustomFieldsData = data.activityCustomFields || [];

    // Pre-select active linked custom fields
    const activeIds: number[] = (data.activityCustomFields || [])
      .filter((cf: any) => cf.active)
      .map((cf: any) => cf.customFieldId);

    const fa = this.form.get('customFieldIds') as FormArray;
    fa.clear();
    activeIds.forEach(id => fa.push(this.fb.control(id)));
  }

  onSearchCustomFields(event: Event) {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  onCfPrevPage(event: Event) {
    event.preventDefault();
    if (this.cfCurrentPage > 1) {
      this.cfCurrentPage--;
      this.loadCustomFields();
    }
  }

  onCfNextPage(event: Event) {
    event.preventDefault();
    if (this.cfCurrentPage < this.cfTotalPages) {
      this.cfCurrentPage++;
      this.loadCustomFields();
    }
  }

  isCustomFieldChecked(customFieldId: number): boolean {
    const fa = this.form.get('customFieldIds') as FormArray;
    return fa.controls.some(c => c.value === customFieldId);
  }

  onCustomFieldChange(event: Event, customFieldId: number) {
    const checked = (event.target as HTMLInputElement).checked;
    this.toggleCustomField(customFieldId, checked);
  }

  toggleCustomField(customFieldId: number, isChecked: boolean) {
    const fa = this.form.get('customFieldIds') as FormArray;
    if (isChecked) {
      if (!fa.controls.some(c => c.value === customFieldId)) {
        fa.push(this.fb.control(customFieldId));
      }
    } else {
      const index = fa.controls.findIndex(c => c.value === customFieldId);
      if (index !== -1) fa.removeAt(index);
    }
  }

  get selectedCount(): number {
    return (this.form.get('customFieldIds') as FormArray).length;
  }

  goBack(): void {
    this.location.back();
  }

  get f() {
    return this.form.controls;
  }

  get title(): string {
    return this.isEditMode ? 'Edit Business Activity' : 'Add Business Activity';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.form.value;
    const selectedIds: number[] = formValue.customFieldIds || [];

    if (this.isEditMode) {
      const payload = this.buildEditPayload(formValue, selectedIds);

      if (Object.keys(payload).length === 0) {
        this.toastService.info('No changes detected', 'Info');
        this.isSubmitting = false;
        return;
      }

      this.updateBusinessActivity(this.activityId, payload);
    } else {
      const payload: any = {
        activityName: formValue.activityName,
        addCustomFieldIds: selectedIds
      };
      this.addBusinessActivity(payload);
    }
  }

  buildEditPayload(formValue: any, selectedIds: number[]): any {
    const changes: any = {};

    if (formValue.activityName !== this.businessActivity?.activityName) {
      changes.activityName = formValue.activityName;
    }

    const originalMap = new Map<number, any>();
    this.originalCustomFieldsData.forEach((link: any) => {
      originalMap.set(link.customFieldId, link);
    });

    const currentIds = new Set<number>(selectedIds);
    const addCustomFieldIds: number[] = [];
    const updateCustomField: any[] = [];

    currentIds.forEach(id => {
      if (!originalMap.has(id)) {
        addCustomFieldIds.push(id);
      }
    });

    originalMap.forEach((linkData, customFieldId) => {
      const isSelected = currentIds.has(customFieldId);

      if (linkData.active && !isSelected) {
        updateCustomField.push({ activityCustomFieldLinkId: linkData.activityCustomFieldLinkId, active: false });
      }
      if (!linkData.active && isSelected) {
        updateCustomField.push({ activityCustomFieldLinkId: linkData.activityCustomFieldLinkId, active: true });
      }
    });

    if (addCustomFieldIds.length > 0) {
      changes.addCustomFieldIds = addCustomFieldIds;
    }
    if (updateCustomField.length > 0) {
      changes.updateCustomField = updateCustomField;
    }

    return changes;
  }

  addBusinessActivity(payload: any) {
    this.businessActivityService.create(payload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 201) {
            this.toastService.success('Business Activity added successfully', 'Success');
            this.router.navigate(['/business-activity/details', this.encryptionService.encryptForRoute(res.data.activityId)]);
          }
        },
        error: (err: any) => {
          console.error(err);
          if (err.error?.statusCode === 422) {
            const existingId = err.error.data?.activityId;
            if (existingId) {
              this.restoreBusinessActivity(existingId, payload.activityName);
            }
          }
        }
      });
  }

  updateBusinessActivity(id: number, payload: any) {
    this.businessActivityService.update(id, payload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.toastService.success('Business Activity updated successfully', 'Success');
            this.router.navigate(['/business-activity/details', this.encryptionService.encryptForRoute(id)]);
          }
        },
        error: (err: any) => {
          console.error(err);
        }
      });
  }

  restoreBusinessActivity(id: number, name: string) {
    this.confirmationService.confirmRestore(name, `${name} already exists. Restore it?`).subscribe(confirmed => {
      if (confirmed) {
        this.businessActivityService.restore(id).subscribe({
          next: (restoreRes) => {
            if (restoreRes.statusCode === 200) {
              this.toastService.success('Business Activity restored successfully', 'Success');
              this.router.navigate(['/business-activity']);
            }
          },
          error: (e: any) => {
            console.log('error', e);
          }
        });
      }
    });
  }
}
