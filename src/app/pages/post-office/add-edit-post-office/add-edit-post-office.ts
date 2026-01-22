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
    @Inject(MAT_DIALOG_DATA) public data: PostOfficeModel | null,
  ) { }



  ngOnInit() {
    this.formInItialize();
    if (this.data) {
      this.postOffice = this.data;
      const formData = {
        ...this.data,
        zipCodes: this.data.zipCodes.map(z => z.zipCode)
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
      if (!currentZips.includes(value)) {
        const updatedZips = [...currentZips, value];
        this.form.get('zipCodes')?.setValue(updatedZips);
        this.form.get('zipCodes')?.updateValueAndValidity();
      }
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  removeZip(zip: string): void {
    const currentZips = this.form.get('zipCodes')?.value || [];
    const index = currentZips.indexOf(zip);

    if (index >= 0) {
      const updatedZips = [...currentZips];
      updatedZips.splice(index, 1);
      this.form.get('zipCodes')?.setValue(updatedZips);
      this.form.get('zipCodes')?.updateValueAndValidity();
    }
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
        zipCodes: this.form.value.zipCodes,
      }
      console.log("payload", newPostOffice);
      // this.postOfficeService.create(newPostOffice).subscribe({
      //   next: (res) => {
      //     console.log("response", res);
      //     if (res.statusCode === 201) {
      //       this.toastService.success('Post Office added successfully');
      //       this.closeDialog(res);
      //     }
      //   },
      //   error: (error) => {
      //     console.log("error", error);
      //   }
      // })
    }
  }

  updatePostOffice() {
    if (this.form.valid && this.data) {
      const updatedPostOffice = {
        postOfficeName: this.form.value.postOfficeName,
        countryId: this.form.value.countryId,
        zipCodes: this.form.value.zipCodes,
      }
      console.log("payload", updatedPostOffice);
      // this.postOfficeService.update(this.data.postOfficeId, updatedPostOffice).subscribe({
      //   next: (res) => {
      //     console.log("response", res);
      //     if (res.statusCode === 200) {
      //       this.toastService.success('Post Office updated successfully');
      //       this.closeDialog(res);
      //     }
      //     else {
      //       this.toastService.error(res.message);
      //     }
      //   },
      //   error: (error) => {
      //     this.toastService.error(error.message);
      //   }
      // })
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
    return this.data ? 'Edit Post Office' : 'Add Post Office';
  }
}
