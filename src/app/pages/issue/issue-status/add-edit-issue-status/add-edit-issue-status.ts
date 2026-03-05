import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IssueStatusModel } from '../../../../core/_state/issue/issue-status/issue-status.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { IssueStatusService } from '../../../../core/_state/issue/issue-status/issue-status.service';
import { UtilityService } from '../../../../partials/shared_services/utility.service';
import { ToastService } from '../../../../partials/shared_services/toast.service';
import { ConfirmationService } from '../../../../partials/shared_directives/confirmation';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-add-edit-issue-status',
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './add-edit-issue-status.html',
  styleUrl: './add-edit-issue-status.css',
})
export class AddEditIssueStatus {
  form!: FormGroup;
  issueStatusData !: IssueStatusModel;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditIssueStatus>,
    private store: Store,
    private issueStatusService: IssueStatusService,
    private utilityService: UtilityService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: IssueStatusModel | null,
  ) { }

  ngOnInit() {
    this.formInItialize();
    if (this.data) {
      this.issueStatusData = this.data;
      this.form.patchValue(this.data as Partial<Record<string, any>>);
    }
  }

  formInItialize() {
    this.form = this.fb.group({
      issueStatus: ['', Validators.required],
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
        this.updateIssueStatus();
      } else {
        this.addIssueStatus();
      }

    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }
  }

  addIssueStatus() {
    if (this.form.valid) {
      const newIssueStatus = {
        issueStatus: this.form.value.issueStatus,
      }
      console.log("payload", newIssueStatus);
      this.issueStatusService.create(newIssueStatus).subscribe({
        next: (res) => {
          console.log("response", res);
          if (res.statusCode === 201) {
            this.toastService.success('Issue Status added successfully', 'Success');
            this.closeDialog(res);
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          console.log("error", error.error);
          this.isSubmitting = false;
          if (error.error.statusCode === 422) {
            const existingId = error.error.data?.issueStatusId;
            if (existingId) {
              this.restoreIssueStatus(existingId, this.form.value.issueStatus);
            }
          }
        }
      })
    }
  }

  updateIssueStatus() {
    if (this.form.valid && this.data) {
      const updatedIssueStatus = {
        issueStatus: this.form.value.issueStatus,
        active: this.data.active
      }
      console.log("payload", updatedIssueStatus);
      this.issueStatusService.update(this.data.issueStatusId, updatedIssueStatus).subscribe({
        next: (res) => {
          console.log("response", res);
          if (!res || res.statusCode === 200 || res.statusCode === 204) {
            this.toastService.success('Issue Status updated successfully', 'Success');
            this.closeDialog(res || { statusCode: 200, data: { ...this.data, ...updatedIssueStatus } });
          }
          this.isSubmitting = false;

        },
        error: (error) => {
          this.isSubmitting = false;
        }
      })
    }
  }

  restoreIssueStatus(id: number, name: string) {
    this.confirmationService.confirmRestore(name, `${name} already available, do you want to restore?`).subscribe(confirmed => {
      if (confirmed) {
        this.issueStatusService.restore(id).subscribe({
          next: (restoreRes) => {
            if (restoreRes.statusCode === 200) {
              this.toastService.success('Issue Status restored successfully', 'Success');
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
    return this.data ? 'Edit Issue Status' : 'Add Issue Status';
  }
}
