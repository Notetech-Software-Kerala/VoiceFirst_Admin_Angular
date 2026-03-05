import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { IssueTypeModel } from '../../../../core/_state/issue/issue-type/issue-type.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IssueTypeService } from '../../../../core/_state/issue/issue-type/issue-type.service';
import { UtilityService } from '../../../../partials/shared_services/utility.service';
import { ToastService } from '../../../../partials/shared_services/toast.service';
import { ConfirmationService } from '../../../../partials/shared_directives/confirmation';
import { MaterialModule } from '../../../../material.module';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { IssueMediaFormatService } from '../../../../core/_state/issue/issue-media-format/issue-media-format.service';
import { IssueMediaTypeService } from '../../../../core/_state/issue/issue-media-type/issue-media-type.service';

@Component({
  selector: 'app-add-edit-issue-type',
  imports: [MaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-edit-issue-type.html',
  styleUrl: './add-edit-issue-type.css',
})
export class AddEditIssueType implements OnInit {
  form!: FormGroup;
  isSubmitting = false;
  mediaFormats: any[] = [];
  mediaTypes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditIssueType>,
    private store: Store,
    private issueTypeService: IssueTypeService,
    private issueMediaFormatService: IssueMediaFormatService,
    private issueMediaTypeService: IssueMediaTypeService,
    private utilityService: UtilityService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: IssueTypeModel | null,
  ) { }

  ngOnInit() {
    this.formInitialize();
    this.loadLookups();
    if (this.data) {
      this.form.patchValue({ issueType: this.data.issueType });
    }
  }

  formInitialize() {
    this.form = this.fb.group({
      issueType: ['', Validators.required],
      mediaRules: this.fb.array([])
    });
  }

  loadLookups() {
    this.issueMediaFormatService.lookup().subscribe({
      next: (res: any) => {
        this.mediaFormats = res.data || [];
      },
      error: () => { }
    });
    this.issueMediaTypeService.lookup().subscribe({
      next: (res: any) => {
        this.mediaTypes = res.data || [];
      },
      error: () => { }
    });
  }

  get mediaRules(): FormArray {
    return this.form.get('mediaRules') as FormArray;
  }

  getMediaTypes(ruleIndex: number): FormArray {
    return this.mediaRules.at(ruleIndex).get('mediaTypes') as FormArray;
  }

  addMediaRule() {
    const ruleGroup = this.fb.group({
      issueMediaFormatId: [null, Validators.required],
      min: [0, [Validators.required, Validators.min(0)]],
      max: [1, [Validators.required, Validators.min(1)]],
      maxSizeMB: [5, [Validators.required, Validators.min(0.1)]],
      mediaTypes: this.fb.array([])
    });
    this.mediaRules.push(ruleGroup);
  }

  removeMediaRule(index: number) {
    this.mediaRules.removeAt(index);
  }

  addMediaType(ruleIndex: number) {
    const typeGroup = this.fb.group({
      issueMediaTypeId: [null, Validators.required],
      isMandatory: [false]
    });
    this.getMediaTypes(ruleIndex).push(typeGroup);
  }

  removeMediaType(ruleIndex: number, typeIndex: number) {
    this.getMediaTypes(ruleIndex).removeAt(typeIndex);
  }

  closeDialog(response?: any): void {
    this.dialogRef.close(response);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    if (this.data) {
      this.updateIssueType();
    } else {
      this.addIssueType();
    }
  }

  addIssueType() {
    const payload = this.buildPayload();
    this.issueTypeService.create(payload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 201) {
            this.toastService.success('Issue Type added successfully', 'Success');
            this.closeDialog(res);
          }
        },
        error: (err) => {
          console.error(err);
          if (err.error?.statusCode === 422) {
            const existingId = err.error.data?.issueTypeId;
            if (existingId) {
              this.restoreIssueType(existingId, this.form.value.issueType);
            }
          }
        }
      });
  }

  updateIssueType() {
    const payload: any = { issueType: this.form.value.issueType };
    if (this.mediaRules.length > 0) {
      payload.mediaRules = this.buildMediaRulesPayload();
    }
    this.issueTypeService.update(this.data!.issueTypeId, payload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          if (!res || res.statusCode === 200 || res.statusCode === 204) {
            this.toastService.success('Issue Type updated successfully', 'Success');
            this.closeDialog(res);
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  restoreIssueType(id: number, name: string) {
    this.confirmationService.confirmRestore(name, `${name} already exists, do you want to restore it?`).subscribe(confirmed => {
      if (confirmed) {
        this.issueTypeService.restore(id).subscribe({
          next: (res: any) => {
            if (res.statusCode === 200) {
              this.toastService.success('Issue Type restored successfully', 'Success');
              this.closeDialog(res);
            }
          },
          error: (err) => console.log('error', err)
        });
      }
    });
  }

  buildPayload() {
    return {
      issueType: this.form.value.issueType,
      mediaRules: this.buildMediaRulesPayload()
    };
  }

  buildMediaRulesPayload() {
    return this.mediaRules.controls.map(rule => ({
      issueMediaFormatId: rule.get('issueMediaFormatId')?.value,
      min: rule.get('min')?.value,
      max: rule.get('max')?.value,
      maxSizeMB: rule.get('maxSizeMB')?.value,
      mediaTypes: (rule.get('mediaTypes') as FormArray).controls.map(t => ({
        issueMediaTypeId: t.get('issueMediaTypeId')?.value,
        isMandatory: t.get('isMandatory')?.value
      }))
    }));
  }

  get f() {
    return this.form.controls;
  }

  get title(): string {
    return this.data ? 'Edit Issue Type' : 'Add Issue Type';
  }
}
