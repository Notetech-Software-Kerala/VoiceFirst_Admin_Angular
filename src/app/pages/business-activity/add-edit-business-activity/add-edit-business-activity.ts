import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BusinessActivityModel } from '../../../core/_state/business-activity/business-activity.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'app-add-edit-business-activity',
  imports: [MaterialModule],
  templateUrl: './add-edit-business-activity.html',
  styleUrl: './add-edit-business-activity.css',
})
export class AddEditBusinessActivity {
  form!: FormGroup;
  businessActivity !: BusinessActivityModel;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditBusinessActivity>,
    @Inject(MAT_DIALOG_DATA) public data: BusinessActivityModel | null,
  ) { }



  ngOnInit() {
    this.formInItialize();
    // If the dialog was opened with existing business activity data, populate the form
    if (this.data) {
      this.businessActivity = this.data;
      this.form.patchValue(this.data as Partial<Record<string, any>>);
    }

  }

  formInItialize() {
    this.form = this.fb.group({
      name: ['', Validators.required],
      in_company: [false],
      in_branch: [false],
      in_section: [false],
      in_sub_section: [false],
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  isSubmitting = false;

  // Form submit function
  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      console.log('Form Data:', this.form.value);

      // Simulate API call
      setTimeout(() => {
        if (this.data) {
          this.updateBusinessActivity();
        } else {
          this.addBusinessActivity();
        }
        this.closeDialog();
        this.isSubmitting = false;
      }, 1500);

    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }
  }

  addBusinessActivity() {
    if (this.form.valid) {
      const newBusinessActivity = {
        name: this.form.value.name,
        in_company: this.form.value.in_company,
        in_branch: this.form.value.in_branch,
        in_section: this.form.value.in_section,
        in_sub_section: this.form.value.in_sub_section,
      }
      console.log("payload", newBusinessActivity);
    }
  }

  updateBusinessActivity() {
    if (this.form.valid && this.data) {
      const updatedBusinessActivity = {
        company_business_activity_id: this.data.company_business_activity_id,
        name: this.form.value.name,
        in_company: this.form.value.in_company,
        in_branch: this.form.value.in_branch,
        in_section: this.form.value.in_section,
        in_sub_section: this.form.value.in_sub_section,
      }
      console.log("payload", updatedBusinessActivity);
    }
  }

  // Utility to mark all fields as touched to trigger validation messages
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control); // Recursively check nested form groups
      }
    });
  }

  // Utility function to easily access form control status for display
  get f() {
    return this.form.controls;
  }

  get title(): string {
    return this.data ? 'Edit Business Activity' : 'Add Business Activity';
  }
}
