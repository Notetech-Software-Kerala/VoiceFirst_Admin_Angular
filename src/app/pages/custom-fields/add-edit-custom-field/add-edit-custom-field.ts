import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { CustomFieldService } from '../../../core/_state/custom-field/custom-field.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { CommonModule, Location } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomFieldModel, CustomFieldValidation, CustomFieldOption } from '../../../core/_state/custom-field/custom-field.model';

@Component({
  selector: 'app-add-edit-custom-field',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './add-edit-custom-field.html',
  styleUrl: './add-edit-custom-field.css',
})
export class AddEditCustomField implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  customFieldId!: number;
  submitting = false;
  originalData!: CustomFieldModel;

  dataTypes: any[] = [];
  validationRules: any[] = [];
  selectedDataTypeName = '';

  // Validation Rule Lookup State
  searchRuleText: string = '';
  searchRuleSubject = new Subject<string>();
  rulePage = 1;
  ruleTotalPages = 1;
  readonly ruleLookupLimit = 10;

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private customFieldService: CustomFieldService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private encryptionService: EncryptionService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.searchRuleSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(text => {
      this.searchRuleText = text;
      this.rulePage = 1;
      this.validationRules = [];
      this.loadValidationRules();
    });

    this.formInItialize();
    this.loadLookups();
  }

  ngOnDestroy(): void {
    this.searchRuleSubject.complete();
  }

  loadLookups() {
    this.customFieldService.dataTypeLookup().subscribe((res: any) => {
      this.dataTypes = res.data || [];
      this.checkEditMode();
    });
  }

  formInItialize() {
    this.form = this.fb.group({
      fieldName: ['', Validators.required],
      fieldKey: ['', Validators.required],
      fieldDataTypeId: ['', Validators.required],
      validations: this.fb.array([]),
      options: this.fb.array([])
    });

    this.form.get('fieldDataTypeId')?.valueChanges.subscribe(id => {
      const type = this.dataTypes.find(t => t.fieldDataTypeId == id);
      this.selectedDataTypeName = type ? (type.fieldDataType || '').toLowerCase() : '';

      // Clear existing validation rules form inputs when datatype changes
      this.validations.clear();
      this.validationRules = [];
    });
  }

  get validations(): FormArray {
    return this.form.get('validations') as FormArray;
  }

  get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

  hasActiveItems(formArray: FormArray): boolean {
    return formArray.controls.some(c => c.get('active')?.value === true);
  }

  createValidationRule(): FormGroup {
    return this.fb.group({
      customFieldValidationId: [0], // 0 indicates a new rule
      ruleId: ['', Validators.required],
      ruleName: [''], // Holds selected label
      ruleValue: ['', Validators.required],
      message: ['', Validators.required],
      active: [true]
    });
  }

  createOption(): FormGroup {
    return this.fb.group({
      customFieldOptionsId: [0], // 0 indicates a new option
      label: ['', Validators.required],
      value: ['', Validators.required],
      active: [true]
    });
  }

  addValidation() {
    this.validations.push(this.createValidationRule());
    if (this.validationRules.length === 0 && this.ruleTotalPages === 1) {
      this.loadValidationRules();
    }
  }

  // --- Validation Rule Search & Pagination --- //
  loadValidationRules() {
    const params: any = { PageNumber: this.rulePage, Limit: this.ruleLookupLimit };
    if (this.searchRuleText) {
      params.SearchText = this.searchRuleText;
    }

    this.customFieldService.validationRuleLookup(params).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const items = res.data.items || res.data;
          this.validationRules = [...items];
          this.ruleTotalPages = res.data.totalPages || 1;
        }
        this.cdr.markForCheck();
      }
    });
  }

  onRuleSearch(event: any) {
    this.searchRuleSubject.next(event.target.value);
  }

  onPrevRulePage(event: Event) {
    event.stopPropagation();
    if (this.rulePage > 1) {
      this.rulePage--;
      this.validationRules = [];
      this.loadValidationRules();
    }
  }

  onNextRulePage(event: Event) {
    event.stopPropagation();
    if (this.rulePage < this.ruleTotalPages) {
      this.rulePage++;
      this.validationRules = [];
      this.loadValidationRules();
    }
  }

  selectRule(index: number, rule: any) {
    const valGroup = this.validations.at(index) as FormGroup;
    valGroup.patchValue({
      ruleId: rule.ruleId,
      ruleName: rule.ruleName
    });
  }

  removeValidation(index: number) {
    const valGroup = this.validations.at(index) as FormGroup;
    const id = valGroup.get('customFieldValidationId')?.value;
    if (id !== 0) {
      valGroup.get('active')?.setValue(false);
      // We don't remove it from the array if it exists in DB, we just mark active=false so we can track deletion
    } else {
      this.validations.removeAt(index);
    }
  }

  addOption() {
    this.options.push(this.createOption());
  }

  removeOption(index: number) {
    const optGroup = this.options.at(index) as FormGroup;
    const id = optGroup.get('customFieldOptionsId')?.value;
    if (id !== 0) {
      optGroup.get('active')?.setValue(false);
    } else {
      this.options.removeAt(index);
    }
  }

  checkEditMode() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        const decryptedId = this.encryptionService.decryptFromRoute(params['id']);
        if (decryptedId) {
          this.isEditMode = true;
          this.customFieldId = +decryptedId;
          this.loadCustomFieldData(this.customFieldId);
        } else {
          this.toastService.error('Invalid Custom Field ID', 'Error');
          this.goBack();
        }
      }
    });
  }

  loadCustomFieldData(id: number) {
    this.customFieldService.getById(id).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.originalData = response.data;
          this.patchForm(response.data);
        }
      },
      error: (error) => {
        console.error(error);
        this.toastService.error('Failed to load Custom Field data', 'Error');
      }
    });
  }

  patchForm(data: CustomFieldModel) {
    const activeDataType = data.fieldDataTypes && data.fieldDataTypes.length > 0 ? data.fieldDataTypes[0] : null;
    let typeId = activeDataType?.fieldDataTypeId;
    if (!typeId && activeDataType?.fieldDataType && this.dataTypes.length) {
      const match = this.dataTypes.find(t => (t.fieldDataType || '').toLowerCase() === (activeDataType.fieldDataType || '').toLowerCase());
      if (match) typeId = match.fieldDataTypeId;
    }

    this.form.patchValue({
      fieldName: data.fieldName,
      fieldKey: data.fieldKey
    });

    const finishPatching = () => {
      this.form.patchValue({ fieldDataTypeId: typeId || '' }, { emitEvent: false });
      const type = this.dataTypes.find(t => t.fieldDataTypeId == typeId);
      this.selectedDataTypeName = type ? (type.fieldDataType || '').toLowerCase() : '';

      if (activeDataType?.validations && activeDataType.validations.length > 0) {
        activeDataType.validations.forEach((val: any) => {
          let resolvedRuleId = val.ruleId;
          if (!resolvedRuleId && val.ruleName && this.validationRules.length) {
            const ruleMatch = this.validationRules.find(r => (r.ruleName || '').toLowerCase() === (val.ruleName || '').toLowerCase());
            if (ruleMatch) resolvedRuleId = ruleMatch.ruleId;
          }

          this.validations.push(this.fb.group({
            customFieldValidationId: [val.customFieldValidationId],
            ruleId: [resolvedRuleId || '', Validators.required],
            ruleName: [val.ruleName || ''],
            ruleValue: [val.ruleValue, Validators.required],
            message: [val.message, Validators.required],
            active: [val.active]
          }));
        });
      }

      if (activeDataType?.options && activeDataType.options.length > 0) {
        activeDataType.options.forEach((opt: any) => {
          this.options.push(this.fb.group({
            customFieldOptionsId: [opt.customFieldOptionsId],
            label: [opt.label, Validators.required],
            value: [opt.value, Validators.required],
            active: [opt.active]
          }));
        });
      }
    };

    finishPatching();
  }

  goBack() {
    this.location.back();
  }

  get title(): string {
    return this.isEditMode ? 'Edit Custom Field' : 'Add Custom Field';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    if (this.isEditMode) {
      this.editCustomField();
    } else {
      this.addCustomField();
    }
  }

  addCustomField() {
    const formValue = this.form.value;

    const payload: any = {
      fieldName: formValue.fieldName,
      fieldKey: formValue.fieldKey
    };

    const addValidations = formValue.validations
      .filter((v: any) => v.active !== false)
      .map((v: any) => ({
        ruleId: +v.ruleId,
        ruleValue: v.ruleValue,
        message: v.message
      }));

    const addOptions: any[] = [];
    const isOptionType = ['dropdown', 'select', 'checkbox', 'radio'].includes(this.selectedDataTypeName);

    if (isOptionType) {
      formValue.options
        .filter((o: any) => o.active !== false)
        .forEach((o: any) => addOptions.push({
          label: o.label,
          value: o.value
        }));
    }

    payload.addCustomFieldDataType = [
      {
        fieldDataTypeId: +formValue.fieldDataTypeId,
        valueDataType: "Varchar", // default fallback
        addValidations: addValidations.length > 0 ? addValidations : [],
        addOptions: addOptions.length > 0 ? addOptions : []
      }
    ];

    console.log('Add Custom Field Payload:', payload);

    this.customFieldService.create(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.toastService.success('Custom Field created successfully', 'Success');
          this.router.navigate(['/custom-field/details', this.encryptionService.encryptForRoute(res.data.customFieldId)]);
        } else {
          this.toastService.error(res.message || 'Operation failed', 'Error');
        }
      },
      error: (error) => {
        this.submitting = false;
        console.error(error);
      }
    });
  }

  editCustomField() {
    const formValue = this.form.value;
    const payload: any = {
      fieldName: formValue.fieldName,
      fieldKey: formValue.fieldKey,
      active: true
    };

    const addValidations: any[] = [];
    const updateValidations: any[] = [];
    const originalDataType = this.originalData.fieldDataTypes && this.originalData.fieldDataTypes.length > 0 ? this.originalData.fieldDataTypes[0] : null;

    formValue.validations.forEach((v: any) => {
      if (v.customFieldValidationId === 0 && v.active !== false) {
        addValidations.push({
          ruleId: +v.ruleId,
          ruleValue: v.ruleValue,
          message: v.message
        });
      } else if (v.customFieldValidationId !== 0) {
        const originalVal = originalDataType?.validations?.find((ov: any) => ov.customFieldValidationId === v.customFieldValidationId);
        if (originalVal) {
          if (originalVal.ruleId !== +v.ruleId || originalVal.ruleValue !== v.ruleValue ||
            originalVal.message !== v.message || originalVal.active !== v.active) {
            updateValidations.push({
              customFieldValidationId: v.customFieldValidationId,
              ruleValue: v.ruleValue, // Assuming the API accepts ruleValue changes without ruleId for updates
              message: v.message,
              active: v.active
            });
          }
        }
      }
    });

    const addOptions: any[] = [];
    const updateOptions: any[] = [];
    const isOptionType = ['dropdown', 'select', 'checkbox', 'radio'].includes(this.selectedDataTypeName);

    if (isOptionType) {
      formValue.options.forEach((o: any) => {
        if (o.customFieldOptionsId === 0 && o.active !== false) {
          addOptions.push({ label: o.label, value: o.value });
        } else if (o.customFieldOptionsId !== 0) {
          const originalOpt = originalDataType?.options?.find((oo: any) => oo.customFieldOptionsId === o.customFieldOptionsId);
          if (originalOpt) {
            if (originalOpt.label !== o.label || originalOpt.value !== o.value || originalOpt.active !== o.active) {
              updateOptions.push({
                customFieldOptionsId: o.customFieldOptionsId,
                label: o.label,
                value: o.value,
                active: o.active
              });
            }
          }
        }
      });
    } else {
      if (originalDataType?.options) {
        originalDataType.options.forEach((oo: any) => {
          updateOptions.push({
            customFieldOptionsId: oo.customFieldOptionsId,
            active: false
          });
        });
      }
    }

    const typeUpdateBlock: any = {
      customFieldLinkId: originalDataType?.customFieldLinkId || 0,
      valueDataType: originalDataType?.valueDataType || "Varchar",
      active: true
    };

    if (addValidations.length) typeUpdateBlock.addValidations = addValidations;
    if (updateValidations.length) typeUpdateBlock.updateValidations = updateValidations;
    if (addOptions.length) typeUpdateBlock.addOptions = addOptions;
    if (updateOptions.length) typeUpdateBlock.updateOptions = updateOptions;

    // Check if Data Type changed (Add it as new or updated)
    let typeId = originalDataType?.fieldDataTypeId;
    if (!typeId && originalDataType?.fieldDataType && this.dataTypes.length) {
      const match = this.dataTypes.find(t => (t.fieldDataType || '').toLowerCase() === (originalDataType.fieldDataType || '').toLowerCase());
      if (match) typeId = match.fieldDataTypeId;
    }

    if (typeId && +formValue.fieldDataTypeId !== typeId) {
      typeUpdateBlock.fieldDataTypeId = +formValue.fieldDataTypeId; // Will include for backend consistency even if not strictly in sample
    }

    payload.updateCustomFieldDataTypes = [typeUpdateBlock];

    console.log('Update Custom Field Payload:', payload);

    this.customFieldService.update(this.customFieldId, payload).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 200) {
          this.toastService.success('Custom Field updated successfully', 'Success');
          this.router.navigate(['/custom-field/details', this.encryptionService.encryptForRoute(this.customFieldId)]);
        } else {
          this.toastService.error(res.message || 'Operation failed', 'Error');
        }
      },
      error: (error) => {
        this.submitting = false;
        console.error(error);
      }
    });
  }
}
