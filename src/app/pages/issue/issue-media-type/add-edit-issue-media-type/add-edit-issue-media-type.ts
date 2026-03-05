import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IssueMediaTypeModel } from '../../../../core/_state/issue/issue-media-type/issue-media-type.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IssueMediaTypeService } from '../../../../core/_state/issue/issue-media-type/issue-media-type.service';
import { UtilityService } from '../../../../partials/shared_services/utility.service';
import { ToastService } from '../../../../partials/shared_services/toast.service';
import { ConfirmationService } from '../../../../partials/shared_directives/confirmation';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-add-edit-issue-media-type',
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './add-edit-issue-media-type.html',
  styleUrl: './add-edit-issue-media-type.css',
})
export class AddEditIssueMediaType {
  form!: FormGroup;
  issueMediaType !: IssueMediaTypeModel;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditIssueMediaType>,
    private store: Store,
    private issueMediaTypeService: IssueMediaTypeService,
    private utilityService: UtilityService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: IssueMediaTypeModel | null,
  ) { }

  ngOnInit() {
    this.formInItialize();
    if (this.data) {
      this.issueMediaType = this.data;
      this.form.patchValue(this.data as Partial<Record<string, any>>);
    }
  }

  formInItialize() {
    this.form = this.fb.group({
      issueMediaFormat: ['', Validators.required],
    });
  }

  closeDialog(response?: any): void {
    this.dialogRef.close(response);
  }

  isSubmitting = false;

  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      console.log('Form Data:', this.form.value);

      if (this.data) {
        this.updateIssueMediaType();
      } else {
        this.addIssueMediaType();
      }

    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }
  }

  addIssueMediaType() {
    if (this.form.valid) {
      const newIssueMediaType = {
        issueMediaFormat: this.form.value.issueMediaFormat,
      }
      console.log("payload", newIssueMediaType);
      this.issueMediaTypeService.create(newIssueMediaType).subscribe({
        next: (res) => {
          console.log("response", res);
          if (res.statusCode === 201) {
            this.toastService.success('Issue Media Type added successfully', 'Success');
            this.closeDialog(res);
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          console.log("error", error.error);
          this.isSubmitting = false;
          if (error.error.statusCode === 422) {
            const existingId = error.error.data?.issueMediaFormatId;
            if (existingId) {
              this.restoreIssueMediaType(existingId, this.form.value.issueMediaFormat);
            }
          }
        }
      })
    }
  }

  updateIssueMediaType() {
    if (this.form.valid && this.data) {
      const updatedIssueMediaType = {
        issueMediaFormat: this.form.value.issueMediaFormat,
        active: this.data.active
      }
      console.log("payload", updatedIssueMediaType);
      this.issueMediaTypeService.update(this.data.issueMediaFormatId, updatedIssueMediaType).subscribe({
        next: (res) => {
          console.log("response", res);
          if (res.statusCode === 200) {
            this.toastService.success('Issue Media Type updated successfully', 'Success');
            this.closeDialog(res);
          }
          this.isSubmitting = false;

        },
        error: (error) => {
          this.isSubmitting = false;
        }
      })
    }
  }

  restoreIssueMediaType(id: number, name: string) {
    this.confirmationService.confirmRestore(name, `${name} already available, do you want to restore?`).subscribe(confirmed => {
      if (confirmed) {
        this.issueMediaTypeService.restore(id).subscribe({
          next: (restoreRes) => {
            if (restoreRes.statusCode === 200) {
              this.toastService.success('Issue Media Type restored successfully', 'Success');
              this.closeDialog(restoreRes);
            }
          },
          error: (err) => {
            console.log("error", err);
          }
        });
      }
    });
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  get title(): string {
    return this.data ? 'Edit Issue Media Type' : 'Add Issue Media Type';
  }
}
