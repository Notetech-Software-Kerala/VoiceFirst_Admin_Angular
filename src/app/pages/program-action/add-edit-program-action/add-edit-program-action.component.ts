import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';
import { ProgramActionModel } from '../../../core/_state/program-action/program-action.model';
import { Store } from '@ngrx/store';
import { ProgramActionService } from '../../../core/_state/program-action/program-action.service';
import { ProgramActionActions } from '../../../core/_state/program-action/program-action.action';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { ConfirmationService } from '../../../partials/shared_services/confirmation';

@Component({
  selector: 'app-add-edit-program-action',
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './add-edit-program-action.component.html',
  styleUrl: './add-edit-program-action.component.css'
})
export class AddEditProgramActionComponent implements OnInit {
  form!: FormGroup;
  programAction !: ProgramActionModel;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditProgramActionComponent>,
    private store: Store,
    private programActionService: ProgramActionService,
    private utilityService: UtilityService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: ProgramActionModel | null,
  ) { }



  ngOnInit() {
    this.formInItialize();
    if (this.data) {
      this.programAction = this.data;
      this.form.patchValue(this.data as Partial<Record<string, any>>);
    }

  }

  formInItialize() {
    this.form = this.fb.group({
      actionName: ['', Validators.required],
    });
  }

  closeDialog(response?: any): void {
    this.dialogRef.close(response);
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
          this.updateProgramAction();
        } else {
          this.addProgramAction();
        }
        this.closeDialog();
        this.isSubmitting = false;
      }, 1500);

    } else {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }
  }

  addProgramAction() {
    if (this.form.valid) {
      const newProgramAction = {
        actionName: this.form.value.actionName,
      }
      console.log("payload", newProgramAction);
      this.programActionService.create(newProgramAction).subscribe({
        next: (res) => {
          console.log("response", res);
          if (res.statusCode === 201) {
            this.toastService.success('Program Action added successfully', 'Success');

            this.closeDialog(res);
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          console.log("error", error.error);
          this.isSubmitting = false;
          if (error.error.statusCode === 422) {
            const existingId = error.error.data?.actionId;
            if (existingId) {
              this.restoreProgramAction(existingId, this.form.value.actionName);
            }
          }
        }
      })
    }
  }

  updateProgramAction() {
    if (this.form.valid && this.data) {
      const updatedProgramAction = {
        actionName: this.form.value.actionName,
      }
      console.log("payload", updatedProgramAction);
      this.programActionService.update(this.data.actionId, updatedProgramAction).subscribe({
        next: (res) => {
          console.log("response", res);
          if (res.statusCode === 200) {
            this.toastService.success('Program Action updated successfully', 'Success');
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

  restoreProgramAction(id: number, name: string) {
    this.confirmationService.confirmRestore(name, `${name} already available, do you want to restore?`).subscribe(confirmed => {
      if (confirmed) {
        this.programActionService.restore(id).subscribe({
          next: (restoreRes) => {
            if (restoreRes.statusCode === 200) {
              this.toastService.success('Program Action restored successfully', 'Success');
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
    return this.data ? 'Edit Program Action' : 'Add Program Action';
  }
}
