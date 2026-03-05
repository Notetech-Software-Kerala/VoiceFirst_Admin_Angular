import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material.module';
import { IssueCharacterTypeModel } from '../../../../core/_state/issue/issue-character-type/issue-character-type.model';
import { Store } from '@ngrx/store';
import { IssueCharacterTypeService } from '../../../../core/_state/issue/issue-character-type/issue-character-type.service';
import { IssueCharacterTypeActions } from '../../../../core/_state/issue/issue-character-type/issue-character-type.action';
import { ToastService } from '../../../../partials/shared_services/toast.service';
import { UtilityService } from '../../../../partials/shared_services/utility.service';
import { ConfirmationService } from '../../../../partials/shared_directives/confirmation';

@Component({
  selector: 'app-add-edit-issue-character-type',
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './add-edit-issue-character-type.html',
  styleUrl: './add-edit-issue-character-type.css',
})
export class AddEditIssueCharacterTypeComponent implements OnInit {
  form!: FormGroup;
  issueCharacterType !: IssueCharacterTypeModel;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditIssueCharacterTypeComponent>,
    private store: Store,
    private issueCharacterTypeService: IssueCharacterTypeService,
    private utilityService: UtilityService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: IssueCharacterTypeModel | null,
  ) { }

  ngOnInit() {
    this.formInItialize();
    if (this.data) {
      this.issueCharacterType = this.data;
      this.form.patchValue(this.data as Partial<Record<string, any>>);
    }
  }

  formInItialize() {
    this.form = this.fb.group({
      issueCharacterType: ['', Validators.required],
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
        this.updateIssueCharacterType();
      } else {
        this.addIssueCharacterType();
      }

    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }
  }

  addIssueCharacterType() {
    if (this.form.valid) {
      const newIssueCharacterType = {
        issueCharacterType: this.form.value.issueCharacterType,
      }
      console.log("payload", newIssueCharacterType);
      this.issueCharacterTypeService.create(newIssueCharacterType).subscribe({
        next: (res) => {
          console.log("response", res);
          if (res.statusCode === 201) {
            this.toastService.success('Issue Character Type added successfully', 'Success');
            this.closeDialog(res);
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          console.log("error", error.error);
          this.isSubmitting = false;
          if (error.error.statusCode === 422) {
            const existingId = error.error.data?.issueCharacterTypeId;
            if (existingId) {
              this.restoreIssueCharacterType(existingId, this.form.value.issueCharacterType);
            }
          }
        }
      })
    }
  }

  updateIssueCharacterType() {
    if (this.form.valid && this.data) {
      const updatedIssueCharacterType = {
        issueCharacterType: this.form.value.issueCharacterType,
        active: this.data.active
      }
      console.log("payload", updatedIssueCharacterType);
      this.issueCharacterTypeService.update(this.data.issueCharacterTypeId, updatedIssueCharacterType).subscribe({
        next: (res) => {
          console.log("response", res);
          if (res.statusCode === 200) {
            this.toastService.success('Issue Character Type updated successfully', 'Success');
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

  restoreIssueCharacterType(id: number, name: string) {
    this.confirmationService.confirmRestore(name, `${name} already available, do you want to restore?`).subscribe(confirmed => {
      if (confirmed) {
        this.issueCharacterTypeService.restore(id).subscribe({
          next: (restoreRes) => {
            if (restoreRes.statusCode === 200) {
              this.toastService.success('Issue Character Type restored successfully', 'Success');
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
    return this.data ? 'Edit Issue Character Type' : 'Add Issue Character Type';
  }
}
