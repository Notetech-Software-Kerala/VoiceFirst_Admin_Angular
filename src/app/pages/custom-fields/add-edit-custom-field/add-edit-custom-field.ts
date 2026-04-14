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
import { CustomFieldModel } from '../../../core/_state/custom-field/custom-field.model';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';

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

  // Per-block validation rules state
  blockValidationRules: any[][] = [];
  ruleSearchTexts: string[] = [];
  rulePages: number[] = [];
  ruleTotalPages: number[] = [];
  readonly ruleLookupLimit = 10;

  private ruleSearchSubject = new Subject<{ index: number; text: string }>();

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private customFieldService: CustomFieldService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private encryptionService: EncryptionService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.ruleSearchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged((a, b) => a.index === b.index && a.text === b.text)
    ).subscribe(({ index, text }) => {
      this.ruleSearchTexts[index] = text;
      this.rulePages[index] = 1;
      this.blockValidationRules[index] = [];
      this.loadValidationRules(index);
    });

    this.formInitialize();
    this.loadLookups();
  }

  ngOnDestroy(): void {
    this.ruleSearchSubject.complete();
  }

  // --- Lookups ---

  loadLookups() {
    this.customFieldService.dataTypeLookup().subscribe((res: any) => {
      this.dataTypes = res.data || [];
      this.checkEditMode();
    });
  }

  loadValidationRules(blockIndex: number) {
    const typeId = (this.dataTypeBlocks.at(blockIndex) as FormGroup).get('fieldDataTypeId')?.value;
    if (!typeId) {
      this.blockValidationRules[blockIndex] = [];
      this.cdr.markForCheck();
      return;
    }

    const page = this.rulePages[blockIndex] || 1;
    const text = this.ruleSearchTexts[blockIndex] || '';
    const params: any = { 
      FieldDataTypeId: typeId,
      PageNumber: page, 
      Limit: this.ruleLookupLimit 
    };
    if (text) {
      params.SearchText = text;
    }

    this.customFieldService.validationRuleLookup(params).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const items = res.data.items || res.data;
          this.blockValidationRules[blockIndex] = [...items];
          this.ruleTotalPages[blockIndex] = res.data.totalPages || 1;
        }
        this.cdr.markForCheck();
      }
    });
  }

  // --- Form Initialization ---

  formInitialize() {
    this.form = this.fb.group({
      fieldName: ['', Validators.required],
      fieldKey: ['', Validators.required],
      dataTypeBlocks: this.fb.array([])
    });
  }

  get dataTypeBlocks(): FormArray {
    return this.form.get('dataTypeBlocks') as FormArray;
  }

  // --- Block Management ---

  createDataTypeBlock(overrides: any = {}): FormGroup {
    return this.fb.group({
      customFieldLinkId: [overrides.customFieldLinkId ?? 0],
      isExisting: [overrides.isExisting ?? false],
      active: [overrides.active ?? true],
      fieldDataTypeId: [overrides.fieldDataTypeId ?? '', Validators.required],
      valueDataType: [overrides.valueDataType ?? 'Varchar'],
      validations: this.fb.array(overrides.validations ?? []),
      options: this.fb.array(overrides.options ?? [])
    });
  }

  addDataTypeBlock() {
    const index = this.dataTypeBlocks.length;
    this.dataTypeBlocks.push(this.createDataTypeBlock());
    this.blockValidationRules[index] = [];
    this.ruleSearchTexts[index] = '';
    this.rulePages[index] = 1;
    this.ruleTotalPages[index] = 1;
  }

  removeDataTypeBlock(index: number) {
    const label = this.getBlockLabel(index);
    this.confirmationService.confirmDelete(label).subscribe(confirmed => {
      if (confirmed) {
        const block = this.dataTypeBlocks.at(index) as FormGroup;
        if (block.get('isExisting')?.value) {
          block.get('active')?.setValue(false);
        } else {
          this.dataTypeBlocks.removeAt(index);
          this.blockValidationRules.splice(index, 1);
          this.ruleSearchTexts.splice(index, 1);
          this.rulePages.splice(index, 1);
          this.ruleTotalPages.splice(index, 1);
        }
        this.cdr.markForCheck();
      }
    });
  }

  recoverDataTypeBlock(index: number) {
    const label = this.getBlockLabel(index);
    this.confirmationService.confirmRestore(label, `Are you sure you want to recover "${label}"?`).subscribe(confirmed => {
      if (confirmed) {
        const block = this.dataTypeBlocks.at(index) as FormGroup;
        block.get('active')?.setValue(true);
        this.cdr.markForCheck();
      }
    });
  }

  onDataTypeChange(blockIndex: number) {
    // Clear previously loaded rules and active validations for this block
    this.blockValidationRules[blockIndex] = [];
    this.rulePages[blockIndex] = 1;
    this.ruleSearchTexts[blockIndex] = '';
    
    // Clear validation forms inside this block so old rules don't get sent incorrectly
    this.getValidations(blockIndex).clear();
    
    // Load rules for new data type
    this.loadValidationRules(blockIndex);
  }

  // --- Block Helpers ---

  isOptionTypeById(id: any): boolean {
    if (!id) return false;
    const type = this.dataTypes.find(t => t.fieldDataTypeId == id);
    return type ? !!type.includesOptions : false;
  }

  isDataTypeSelected(typeId: number, currentBlockIndex: number): boolean {
    return this.dataTypeBlocks.controls.some((block: any, index: number) => 
      index !== currentBlockIndex && 
      block.get('active')?.value !== false && 
      block.get('fieldDataTypeId')?.value == typeId
    );
  }

  isOptionType(blockIndex: number): boolean {
    const id = (this.dataTypeBlocks.at(blockIndex) as FormGroup).get('fieldDataTypeId')?.value;
    return this.isOptionTypeById(id);
  }

  getBlockLabel(blockIndex: number): string {
    const id = (this.dataTypeBlocks.at(blockIndex) as FormGroup).get('fieldDataTypeId')?.value;
    if (!id) return `Data Type #${blockIndex + 1}`;
    const type = this.dataTypes.find(t => t.fieldDataTypeId == id);
    return type ? (type.fieldDataType || '') : `Data Type #${blockIndex + 1}`;
  }

  getBlockRules(blockIndex: number): any[] {
    return this.blockValidationRules[blockIndex] || [];
  }

  hasActiveBlocks(): boolean {
    return this.dataTypeBlocks.controls.some(b => b.get('active')?.value !== false);
  }

  hasActiveItems(formArray: FormArray): boolean {
    return formArray.controls.some(c => c.get('active')?.value === true);
  }

  // --- Validations Management ---

  getValidations(blockIndex: number): FormArray {
    return (this.dataTypeBlocks.at(blockIndex) as FormGroup).get('validations') as FormArray;
  }

  createValidationRule(): FormGroup {
    return this.fb.group({
      customFieldValidationId: [0],
      ruleId: ['', Validators.required],
      ruleName: [''],
      ruleValue: ['', Validators.required],
      message: ['', Validators.required],
      active: [true]
    });
  }

  addValidation(blockIndex: number) {
    this.getValidations(blockIndex).push(this.createValidationRule());
    if (!this.blockValidationRules[blockIndex]?.length) {
      this.loadValidationRules(blockIndex);
    }
  }

  removeValidation(blockIndex: number, valIndex: number) {
    const validations = this.getValidations(blockIndex);
    const valGroup = validations.at(valIndex) as FormGroup;
    const id = valGroup.get('customFieldValidationId')?.value;
    if (id !== 0) {
      valGroup.get('active')?.setValue(false);
    } else {
      validations.removeAt(valIndex);
    }
  }

  selectRule(blockIndex: number, valIndex: number, rule: any) {
    const valGroup = this.getValidations(blockIndex).at(valIndex) as FormGroup;
    valGroup.patchValue({ ruleId: rule.ruleId, ruleName: rule.ruleName });
  }

  onRuleSearch(blockIndex: number, event: any) {
    this.ruleSearchSubject.next({ index: blockIndex, text: event.target.value });
  }

  onPrevRulePage(blockIndex: number, event: Event) {
    event.stopPropagation();
    if ((this.rulePages[blockIndex] || 1) > 1) {
      this.rulePages[blockIndex]--;
      this.blockValidationRules[blockIndex] = [];
      this.loadValidationRules(blockIndex);
    }
  }

  onNextRulePage(blockIndex: number, event: Event) {
    event.stopPropagation();
    const page = this.rulePages[blockIndex] || 1;
    const total = this.ruleTotalPages[blockIndex] || 1;
    if (page < total) {
      this.rulePages[blockIndex]++;
      this.blockValidationRules[blockIndex] = [];
      this.loadValidationRules(blockIndex);
    }
  }

  openRuleDropdown(blockIndex: number) {
    if (!this.blockValidationRules[blockIndex]?.length) {
      this.loadValidationRules(blockIndex);
    }
  }

  // --- Options Management ---

  getOptions(blockIndex: number): FormArray {
    return (this.dataTypeBlocks.at(blockIndex) as FormGroup).get('options') as FormArray;
  }

  createOption(): FormGroup {
    return this.fb.group({
      customFieldOptionsId: [0],
      label: ['', Validators.required],
      value: ['', Validators.required],
      active: [true]
    });
  }

  addOption(blockIndex: number) {
    this.getOptions(blockIndex).push(this.createOption());
  }

  removeOption(blockIndex: number, optIndex: number) {
    const options = this.getOptions(blockIndex);
    const optGroup = options.at(optIndex) as FormGroup;
    const id = optGroup.get('customFieldOptionsId')?.value;
    if (id !== 0) {
      optGroup.get('active')?.setValue(false);
    } else {
      options.removeAt(optIndex);
    }
  }

  // --- Edit Mode & Patching ---

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
      fieldKey: data.fieldKey
    });

    const existingDataTypes = data.fieldDataTypes || [];
    existingDataTypes.forEach((dt: any, i: number) => {
      
      let typeId = dt.fieldDataTypeId;
      if (!typeId && dt.fieldDataType && this.dataTypes.length) {
        const match = this.dataTypes.find(t =>
          (t.fieldDataType || '').toLowerCase() === (dt.fieldDataType || '').toLowerCase()
        );
        if (match) typeId = match.fieldDataTypeId;
      }

      const validationGroups = (dt.validations || []).map((val: any) =>
        this.fb.group({
          customFieldValidationId: [val.customFieldValidationId],
          ruleId: [val.ruleId || '', Validators.required],
          ruleName: [val.ruleName || ''],
          ruleValue: [val.ruleValue, Validators.required],
          message: [val.message, Validators.required],
          active: [val.active]
        })
      );

      const optionGroups = (dt.options || []).map((opt: any) =>
        this.fb.group({
          customFieldOptionsId: [opt.customFieldOptionsId],
          label: [opt.label, Validators.required],
          value: [opt.value, Validators.required],
          active: [opt.active]
        })
      );

      this.dataTypeBlocks.push(this.createDataTypeBlock({
        customFieldLinkId: dt.customFieldLinkId || 0,
        isExisting: true,
        active: dt.active ?? true,
        fieldDataTypeId: typeId || '',
        valueDataType: dt.valueDataType || 'Varchar',
        validations: validationGroups,
        options: optionGroups
      }));

      this.blockValidationRules[i] = [];
      this.ruleSearchTexts[i] = '';
      this.rulePages[i] = 1;
      this.ruleTotalPages[i] = 1;
    });
  }

  goBack() {
    this.location.back();
  }

  get title(): string {
    return this.isEditMode ? 'Edit Custom Field' : 'Add Custom Field';
  }

  // --- Submisson ---

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

  // Matches `{ fieldName, fieldKey, addCustomFieldDataType: [{ fieldDataTypeId, valueDataType, addValidations, addOptions }] }`
  addCustomField() {
    const formValue = this.form.value;

    const payload: any = {
      fieldName: formValue.fieldName,
      fieldKey: formValue.fieldKey
    };

    payload.addCustomFieldDataType = (formValue.dataTypeBlocks || [])
      .filter((b: any) => b.active !== false)
      .map((b: any) => {
        const showOptions = this.isOptionTypeById(b.fieldDataTypeId);

        const addValidations = (b.validations || [])
          .filter((v: any) => v.active !== false)
          .map((v: any) => ({
            ruleId: +v.ruleId,
            ruleValue: v.ruleValue,
            message: v.message
          }));

        const addOptions = showOptions
          ? (b.options || []).filter((o: any) => o.active !== false).map((o: any) => ({ label: o.label, value: o.value }))
          : [];

        return {
          fieldDataTypeId: +b.fieldDataTypeId,
          valueDataType: b.valueDataType || 'Varchar',
          addValidations,
          addOptions
        };
      });

    console.log('Add Custom Field Payload:', JSON.stringify(payload, null, 2));

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

  // Matches `{ fieldName, fieldKey, updateCustomFieldDataTypes: [...], addCustomFieldDataTypes: [...] }`
  editCustomField() {
    const formValue = this.form.value;

    const payload: any = {};

    if (formValue.fieldName !== this.originalData.fieldName) payload.fieldName = formValue.fieldName;
    if (formValue.fieldKey !== this.originalData.fieldKey) payload.fieldKey = formValue.fieldKey;

    const updateCustomFieldDataTypes: any[] = [];
    const addCustomFieldDataTypes: any[] = [];

    (formValue.dataTypeBlocks || []).forEach((b: any) => {
      const showOptions = this.isOptionTypeById(b.fieldDataTypeId);

      if (b.isExisting) {
        const originalDT = (this.originalData.fieldDataTypes || []).find((dt: any) => dt.customFieldLinkId === b.customFieldLinkId);
        const originalActive = originalDT?.active ?? true;

        if (b.active === false) {
           if (originalActive !== false) {
             updateCustomFieldDataTypes.push({
               customFieldLinkId: b.customFieldLinkId,
               valueDataType: b.valueDataType || '0',
               active: false
             });
           }
           return; // skip validations & options
        }

        const addValidations: any[] = [];
        const updateValidations: any[] = [];
        (b.validations || []).forEach((v: any) => {
          if (v.customFieldValidationId === 0 && v.active !== false) {
            addValidations.push({ ruleId: +v.ruleId, ruleValue: v.ruleValue, message: v.message });
          } else if (v.customFieldValidationId !== 0) {
            const orig = originalDT?.validations?.find((ov: any) => ov.customFieldValidationId === v.customFieldValidationId);
            if (orig && (orig.ruleValue !== v.ruleValue || orig.message !== v.message || orig.active !== v.active)) {
              updateValidations.push({
                customFieldValidationId: v.customFieldValidationId,
                ruleValue: v.ruleValue,
                message: v.message,
                active: v.active
              });
            }
          }
        });

        const addOptions: any[] = [];
        const updateOptions: any[] = [];
        if (showOptions) {
          (b.options || []).forEach((o: any) => {
            if (o.customFieldOptionsId === 0 && o.active !== false) {
              addOptions.push({ label: o.label, value: o.value });
            } else if (o.customFieldOptionsId !== 0) {
              const orig = originalDT?.options?.find((oo: any) => oo.customFieldOptionsId === o.customFieldOptionsId);
              if (orig && (orig.label !== o.label || orig.value !== o.value || orig.active !== o.active)) {
                updateOptions.push({
                  customFieldOptionsId: o.customFieldOptionsId,
                  label: o.label,
                  value: o.value,
                  active: o.active
                });
              }
            }
          });
        } else {
          // Deactivate options if datatype changed to non-option type
          (originalDT?.options || []).forEach((oo: any) => {
            if (oo.active !== false) {
              updateOptions.push({ customFieldOptionsId: oo.customFieldOptionsId, active: false });
            }
          });
        }

        const originalValueDataType = originalDT?.valueDataType || 'Varchar';
        const currentValueDataType = b.valueDataType || 'Varchar';

        const hasChanges = 
          originalActive !== b.active || 
          originalValueDataType !== currentValueDataType || 
          addValidations.length > 0 || 
          updateValidations.length > 0 || 
          addOptions.length > 0 || 
          updateOptions.length > 0;

        if (hasChanges) {
          const block: any = {
            customFieldLinkId: b.customFieldLinkId,
            valueDataType: b.valueDataType || 'Varchar',
            active: b.active
          };
          if (addValidations.length) block.addValidations = addValidations;
          if (updateValidations.length) block.updateValidations = updateValidations;
          if (addOptions.length) block.addOptions = addOptions;
          if (updateOptions.length) block.updateOptions = updateOptions;

          updateCustomFieldDataTypes.push(block);
        }

      } else if (b.active !== false) {
        
        // Brand-new block mapping for PATCH requirement: `addCustomFieldDataTypes`
        const addValidations = (b.validations || [])
          .filter((v: any) => v.active !== false)
          .map((v: any) => ({ ruleId: +v.ruleId, ruleValue: v.ruleValue, message: v.message }));

        const addOptions = showOptions
          ? (b.options || []).filter((o: any) => o.active !== false).map((o: any) => ({ label: o.label, value: o.value }))
          : [];

        addCustomFieldDataTypes.push({
          fieldDataTypeId: +b.fieldDataTypeId,
          valueDataType: b.valueDataType || 'Varchar',
          addValidations,
          addOptions
        });
      }
    });

    if (updateCustomFieldDataTypes.length) payload.updateCustomFieldDataTypes = updateCustomFieldDataTypes;
    if (addCustomFieldDataTypes.length) payload.addCustomFieldDataTypes = addCustomFieldDataTypes;

    if (Object.keys(payload).length === 0) {
      this.toastService.info('No changes were detected', 'Info');
      this.submitting = false;
      return;
    }

    console.log('Update Custom Field Payload:', JSON.stringify(payload, null, 2));

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
