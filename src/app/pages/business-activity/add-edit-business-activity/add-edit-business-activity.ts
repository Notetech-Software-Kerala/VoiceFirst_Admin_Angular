import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusinessActivityModel } from '../../../core/_state/business-activity/business-activity.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';
import { BusinessActivityService } from '../../../core/_state/business-activity/business-activity.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { finalize } from 'rxjs';
import { ConfirmationService } from '../../../partials/shared_services/confirmation';

@Component({
  selector: 'app-add-edit-business-activity',
  imports: [MaterialModule],
  templateUrl: './add-edit-business-activity.html',
  styleUrl: './add-edit-business-activity.css',
})
export class AddEditBusinessActivity implements OnInit {
  form!: FormGroup;
  businessActivity !: BusinessActivityModel;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditBusinessActivity>,
    @Inject(MAT_DIALOG_DATA) public data: BusinessActivityModel | null,
    private businessActivityService: BusinessActivityService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    this.formInItialize();
    if (this.data) {
      this.businessActivity = this.data;
      this.form.patchValue({
        ActivityName: this.data.activityName,
        Active: this.data.active
      });
    }
  }

  formInItialize() {
    this.form = this.fb.group({
      ActivityName: ['', Validators.required],
      Active: [true],
    });
  }

  closeDialog(result: any = null): void {
    this.dialogRef.close(result);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formValue = this.form.value;

    const payload: any = {
      ActivityName: formValue.ActivityName,
      Active: formValue.Active ?? true
    };

    if (this.data) {
      this.updateBusinessActivity(this.data.activityId, payload);
    } else {
      this.addBusinessActivity(payload);
    }
  }

  addBusinessActivity(payload: any) {
    this.businessActivityService.create(payload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 201) {
            this.toastService.success('Business Activity added successfully', 'Success');
            this.closeDialog(res);
          }
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          if (err.error.statusCode === 422) {
            const existingId = err.error.data?.activityId;
            if (existingId) {
              this.restoreBusinessActivity(existingId, payload.ActivityName);
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
            this.closeDialog(res);
          }
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
        }
      });
  }

  restoreBusinessActivity(id: number, name: string) {
    this.confirmationService.confirmRestore(name, `${name} already available, do you want to restore?`).subscribe(confirmed => {
      if (confirmed) {
        this.businessActivityService.restore(id).subscribe({
          next: (restoreRes) => {
            if (restoreRes.statusCode === 200) {
              this.toastService.success('Business Activity restored successfully', 'Success');
              this.closeDialog(restoreRes);
            }
          },
          error: (e) => {
            console.log("error", e);
          }
        });
      }
    });
  }

  get f() {
    return this.form.controls;
  }

  get title(): string {
    return this.data ? 'Edit Business Activity' : 'Add Business Activity';
  }
}
