import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IssueMediaFormatModel } from '../../../../core/_state/issue/issue-media-format/issue-media-format.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IssueMediaFormatService } from '../../../../core/_state/issue/issue-media-format/issue-media-format.service';
import { UtilityService } from '../../../../partials/shared_services/utility.service';
import { ToastService } from '../../../../partials/shared_services/toast.service';
import { ConfirmationService } from '../../../../partials/shared_directives/confirmation';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-add-edit-issue-media-format',
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './add-edit-issue-media-format.html',
  styleUrl: './add-edit-issue-media-format.css',
})
export class AddEditIssueMediaFormat {
  form!: FormGroup;
  issueMediaFormatData !: IssueMediaFormatModel;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditIssueMediaFormat>,
    private store: Store,
    private issueMediaFormatService: IssueMediaFormatService,
    private utilityService: UtilityService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: IssueMediaFormatModel | null,
  ) { }

  ngOnInit() {
    this.formInItialize();
    if (this.data) {
      this.issueMediaFormatData = this.data;
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
        this.updateIssueMediaFormat();
      } else {
        this.addIssueMediaFormat();
      }

    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }
  }

  addIssueMediaFormat() {
    if (this.form.valid) {
      const newIssueMediaFormat = {
        issueMediaFormat: this.form.value.issueMediaFormat,
      }
      console.log("payload", newIssueMediaFormat);
      this.issueMediaFormatService.create(newIssueMediaFormat).subscribe({
        next: (res) => {
          console.log("response", res);
          if (res.statusCode === 201) {
            this.toastService.success('Issue Media Format added successfully', 'Success');
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
              this.restoreIssueMediaFormat(existingId, this.form.value.issueMediaFormat);
            }
          }
        }
      })
    }
  }

  updateIssueMediaFormat() {
    if (this.form.valid && this.data) {
      const updatedIssueMediaFormat = {
        issueMediaFormat: this.form.value.issueMediaFormat,
        active: this.data.active
      }
      console.log("payload", updatedIssueMediaFormat);
      this.issueMediaFormatService.update(this.data.issueMediaFormatId, updatedIssueMediaFormat).subscribe({
        next: (res) => {
          console.log("response", res);
          if (!res || res.statusCode === 200 || res.statusCode === 204) {
            this.toastService.success('Issue Media Format updated successfully', 'Success');
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

  restoreIssueMediaFormat(id: number, name: string) {
    this.confirmationService.confirmRestore(name, `${name} already available, do you want to restore?`).subscribe(confirmed => {
      if (confirmed) {
        this.issueMediaFormatService.restore(id).subscribe({
          next: (restoreRes) => {
            if (restoreRes.statusCode === 200) {
              this.toastService.success('Issue Media Format restored successfully', 'Success');
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
    return this.data ? 'Edit Issue Media Format' : 'Add Issue Media Format';
  }
}
