import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
export class AddEditCustomField implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  customFieldId!: number;
  submitting = false;
  originalData!: CustomFieldModel;

  dataTypes = ['Text', 'Number', 'Date', 'Time', 'Dropdown'];

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
    this.formInItialize();
    this.checkEditMode();
  }

  formInItialize() {
    this.form = this.fb.group({
      fieldName: ['', Validators.required],
      fieldKey: ['', Validators.required],
      fieldDataType: ['', Validators.required],
      validations: this.fb.array([]),
      options: this.fb.array([])
    });

    // No longer clearing options array on change so options are preserved when toggling types
    this.form.get('fieldDataType')?.valueChanges.subscribe(type => {
      // Do nothing: Options persist in UI allowing users to switch back to Dropdown without losing data
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
      ruleName: ['', Validators.required],
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
    this.form.patchValue({
      fieldName: data.fieldName,
      fieldKey: data.fieldKey,
      fieldDataType: data.fieldDataType
    });

    if (data.validations && data.validations.length > 0) {
      data.validations.forEach(val => {
        this.validations.push(this.fb.group({
          customFieldValidationId: [val.customFieldValidationId],
          ruleName: [val.ruleName, Validators.required],
          ruleValue: [val.ruleValue, Validators.required],
          message: [val.message, Validators.required],
          active: [val.active]
        }));
      });
    }

    if (data.options && data.options.length > 0) {
      data.options.forEach(opt => {
        this.options.push(this.fb.group({
          customFieldOptionsId: [opt.customFieldOptionsId],
          label: [opt.label, Validators.required],
          value: [opt.value, Validators.required],
          active: [opt.active]
        }));
      });
    }
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
      fieldKey: formValue.fieldKey,
      fieldDataType: formValue.fieldDataType,
    };

    const addValidations = formValue.validations
      .filter((v: any) => v.active !== false)
      .map((v: any) => ({
        ruleName: v.ruleName,
        ruleValue: v.ruleValue,
        message: v.message
      }));

    if (addValidations.length > 0) {
      payload.addValidations = addValidations;
    }

    const isOptionType = formValue.fieldDataType.toLowerCase() === 'dropdown' || formValue.fieldDataType.toLowerCase() === 'checkbox' || formValue.fieldDataType.toLowerCase() === 'radio';

    if (isOptionType) {
      const addOptions = formValue.options
        .filter((o: any) => o.active !== false)
        .map((o: any) => ({
          label: o.label,
          value: o.value
        }));
      if (addOptions.length > 0) {
        payload.addOptions = addOptions;
      }
    } else {
      // For text or non-option types, send null/empty array as requested
      payload.addOptions = [];
    }

    console.log('Add Custom Field Payload:', payload);

    this.customFieldService.create(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.toastService.success('Custom Field created successfully', 'Success');
          this.router.navigate(['/custom-field-details', this.encryptionService.encryptForRoute(res.data.customFieldId)]);
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
    const payload: any = {};

    // Basic fields diff
    if (formValue.fieldName !== this.originalData.fieldName) payload.fieldName = formValue.fieldName;
    if (formValue.fieldKey !== this.originalData.fieldKey) payload.fieldKey = formValue.fieldKey;
    if (formValue.fieldDataType !== this.originalData.fieldDataType) payload.fieldDataType = formValue.fieldDataType;

    // Process Validations
    const addValidations: any[] = [];
    const updateValidations: any[] = [];

    formValue.validations.forEach((v: any) => {
      if (v.customFieldValidationId === 0 && v.active !== false) {
        // New validation
        addValidations.push({
          ruleName: v.ruleName,
          ruleValue: v.ruleValue,
          message: v.message
        });
      } else if (v.customFieldValidationId !== 0) {
        // Find existing to check for changes
        const originalVal = this.originalData.validations?.find(ov => ov.customFieldValidationId === v.customFieldValidationId);
        if (originalVal) {
          if (originalVal.ruleName !== v.ruleName || originalVal.ruleValue !== v.ruleValue ||
            originalVal.message !== v.message || originalVal.active !== v.active) {
            updateValidations.push({
              customFieldValidationId: v.customFieldValidationId,
              ruleName: v.ruleName,
              ruleValue: v.ruleValue,
              message: v.message,
              active: v.active
            });
          }
        }
      }
    });

    if (addValidations.length > 0) payload.addValidations = addValidations;
    if (updateValidations.length > 0) payload.updateValidations = updateValidations;

    // Process Options (Only if it's an option type, else delete existing options)
    const addOptions: any[] = [];
    const updateOptions: any[] = [];

    const isOptionType = formValue.fieldDataType.toLowerCase() === 'dropdown' || formValue.fieldDataType.toLowerCase() === 'checkbox' || formValue.fieldDataType.toLowerCase() === 'radio';

    if (isOptionType) {
      formValue.options.forEach((o: any) => {
        if (o.customFieldOptionsId === 0 && o.active !== false) {
          // New option
          addOptions.push({
            label: o.label,
            value: o.value
          });
        } else if (o.customFieldOptionsId !== 0) {
          const originalOpt = this.originalData.options?.find(oo => oo.customFieldOptionsId === o.customFieldOptionsId);
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
      // It's a non-option type (e.g. Text). Mark all existing original options from the DB as deleted.
      if (this.originalData.options) {
        this.originalData.options.forEach(oo => {
          updateOptions.push({
            customFieldOptionsId: oo.customFieldOptionsId,
            active: false
          });
        });
      }
      payload.addOptions = []; // Ensure new additions are sent as empty per requirements
    }

    if (addOptions.length > 0) payload.addOptions = addOptions;
    if (updateOptions.length > 0) payload.updateOptions = updateOptions;


    if (Object.keys(payload).length === 0) {
      this.toastService.info('No changes detected', 'Info');
      this.submitting = false;
      return;
    }

    console.log('Update Custom Field Payload:', payload);

    this.customFieldService.update(this.customFieldId, payload).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 200) {
          this.toastService.success('Custom Field updated successfully', 'Success');
          this.router.navigate(['/custom-field-details', this.encryptionService.encryptForRoute(this.customFieldId)]);
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
