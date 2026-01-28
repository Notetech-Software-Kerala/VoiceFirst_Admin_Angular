import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostOfficeModel } from '../../../core/_state/post-office/post-office.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PostOfficeService } from '../../../core/_state/post-office/post-office.service';
import { Store } from '@ngrx/store';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { MaterialModule } from '../../../material.module';
import { CountryModel } from '../../../core/_state/country/country.model';
import { CountryService } from '../../../core/_state/country/country.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ConfirmationService } from '../../../partials/shared_services/confirmation';

@Component({
  selector: 'app-add-edit-post-office',
  imports: [MaterialModule],
  templateUrl: './add-edit-post-office.html',
  styleUrl: './add-edit-post-office.css',
})
export class AddEditPostOffice {
  form!: FormGroup;
  postOffice !: PostOfficeModel;
  isSubmitting = false;
  countryList: CountryModel[] = [];
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddEditPostOffice>,
    private store: Store,
    private postOfficeService: PostOfficeService,
    private utilityService: UtilityService,
    private toastService: ToastService,
    private countryService: CountryService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: PostOfficeModel | null,
  ) { }



  ngOnInit() {
    this.formInItialize();
    if (this.data) {
      this.postOffice = this.data;
      const formData = {
        ...this.data,
        zipCodes: this.data.zipCodes.map(z => ({
          zipCode: z.zipCode,
          zipCodeId: z.zipCodeId,
          deleted: z.deleted,
          active: z.active
        }))
      };
      this.form.patchValue(formData);
    }

    this.getCountries();
    this.cdr.detectChanges();

  }

  formInItialize() {
    this.form = this.fb.group({
      postOfficeName: ['', Validators.required],
      countryId: ['', Validators.required],
      zipCodes: [[], Validators.required],
    });
  }

  closeDialog(response?: any): void {
    this.dialogRef.close(response);
  }


  getCountries() {
    this.countryService.lookup().subscribe({
      next: (res: any) => {
        console.log("response", res);
        if (res.statusCode === 200) {
          this.countryList = res.data;
        }
      },
      error: (error) => {
        console.log("error", error);
      }
    })
  }


  // Chip input handlers
  addZip(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our zip
    if (value) {
      const currentZips = this.form.get('zipCodes')?.value || [];
      // Optional: Check duplicates
      const exists = currentZips.some((z: any) => z.zipCode === value);
      if (!exists) {
        const updatedZips = [...currentZips, { zipCode: value, zipCodeId: 0, deleted: false, active: true }];
        this.form.get('zipCodes')?.setValue(updatedZips);
        this.form.get('zipCodes')?.updateValueAndValidity();
      }
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeZip(zip: any): void {
    const currentZips = this.form.get('zipCodes')?.value || [];
    const index = currentZips.findIndex((z: any) => z.zipCode === zip.zipCode);

    if (index < 0) {
      return;
    }

    // If editing an existing post office and this zip exists on the server,
    // call the deleteZipcode API with its id. Otherwise just remove locally.
    if (zip.zipCodeId && zip.zipCodeId !== 0) {
      this.confirmationService.confirmDelete(`Zip code ${zip.zipCode}`).subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        this.postOfficeService.deleteZipcode(zip.zipCodeId).subscribe({
          next: (res) => {
            if ((res as any).statusCode === 200) {
              // Don't remove from list, just mark as deleted so it shows the restore button
              const updatedZips = [...currentZips];
              updatedZips[index] = { ...updatedZips[index], deleted: true, active: false };
              this.form.get('zipCodes')?.setValue(updatedZips);
              this.form.get('zipCodes')?.updateValueAndValidity();

              this.toastService.success('Zip code removed successfully', 'Success');
            } else {
              this.toastService.error((res as any).message || 'Failed to remove zip code', 'Failed');
            }
          },
          error: () => {

          }
        });
      });
    } else {
      const updatedZips = [...currentZips];
      updatedZips.splice(index, 1);
      this.form.get('zipCodes')?.setValue(updatedZips);
      this.form.get('zipCodes')?.updateValueAndValidity();
    }
  }

  restoreZip(zip: any): void {
    this.confirmationService.confirmRestore(zip.zipCode, `Do you want to restore zip code ${zip.zipCode}?`).subscribe(confirmed => {
      if (confirmed) {
        this.postOfficeService.restoreZipcode(zip.zipCodeId).subscribe({
          next: (res) => {
            if (res.statusCode === 200) {
              const currentZips = this.form.get('zipCodes')?.value || [];
              const updatedZips = currentZips.map((z: any) => {
                if (z.zipCodeId === zip.zipCodeId) {
                  return { ...z, deleted: false, active: true };
                }
                return z;
              });
              this.form.get('zipCodes')?.setValue(updatedZips);
              this.toastService.success('Zip code restored successfully', 'Success');
            }
          },
          error: (err) => {
            console.log("error", err);
          }
        });
      }
    });
  }

  // Form submit function
  onSubmit() {
    if (this.form.valid) {
      this.isSubmitting = true;
      console.log('Form Data:', this.form.value);
      if (this.data) {
        this.updatePostOffice();
      } else {
        this.addPostOffice();
      }
    }


  }

  addPostOffice() {
    if (this.form.valid) {
      const newPostOffice = {
        postOfficeName: this.form.value.postOfficeName,
        countryId: this.form.value.countryId,
        zipCodes: (this.form.value.zipCodes || []).map((z: any) => z.zipCode),
      }
      console.log("payload", newPostOffice);
      this.postOfficeService.create(newPostOffice).subscribe({
        next: (res) => {
          console.log("response", res);
          if (res.statusCode === 201) {
            this.toastService.success('Post Office added successfully', 'Success');
            this.closeDialog(res);
          }
          else {
            this.toastService.error(res.message, 'Failed');
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          this.isSubmitting = false;
          if (error.error.statusCode === 422) {
            const existingId = error.error.data?.postOfficeId;
            if (existingId) {
              this.restorePostOffice(existingId, newPostOffice.postOfficeName);
            }
          }
        }
      })
    }
  }

  updatePostOffice() {
    if (this.form.valid && this.data) {
      const changes = this.getChangedValues(this.form.value, this.data);

      if (Object.keys(changes).length === 0) {
        this.toastService.info('No changes detected', 'Info');
        this.isSubmitting = false;
        return;
      }

      console.log("payload", changes);
      this.postOfficeService.update(this.data.postOfficeId, changes).subscribe({
        next: (res) => {
          console.log("response", res);
          if (res.statusCode === 200) {
            this.toastService.success('Post Office updated successfully', 'Success');
            this.closeDialog(res);
          }
          else {
            this.toastService.error(res.message, 'Failed');
          }
          this.isSubmitting = false;
        },
        error: (error) => {
          this.isSubmitting = false;
        }
      })
    }
  }

  restorePostOffice(id: number, name: string) {
    this.confirmationService.confirmRestore(name, `${name} already available, do you want to restore?`).subscribe(confirmed => {
      if (confirmed) {
        this.postOfficeService.restore(id).subscribe({
          next: (restoreRes) => {
            if (restoreRes.statusCode === 200) {
              this.toastService.success('Post Office restored successfully', 'Success');
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

  getChangedValues(formValue: any, originalData: PostOfficeModel): any {
    const changes: any = {};

    if (formValue.postOfficeName !== originalData.postOfficeName) {
      changes.postOfficeName = formValue.postOfficeName;
    }

    if (formValue.countryId !== originalData.countryId) {
      changes.countryId = formValue.countryId;
    }

    // Zip codes: deletions are handled by deleteZipcode API.
    // For updates we only send newly added zip codes.
    const formZips = formValue.zipCodes || [];

    // Filter out only new ones (zipCodeId == 0)
    const addedZips = formZips.filter((z: any) => z.zipCodeId === 0);

    if (addedZips.length > 0) {
      changes.zipCodes = addedZips.map((z: any) => ({
        zipCode: z.zipCode
      }));
    }

    return changes;
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
    return this.data ? 'Edit Post Office' : 'Add Post Office';
  }
}
