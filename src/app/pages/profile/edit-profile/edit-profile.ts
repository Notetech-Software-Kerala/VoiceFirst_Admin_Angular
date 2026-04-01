import { Component, OnInit, ChangeDetectorRef, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { UserService } from '../../../core/_state/user/user.service';
import { CountryService } from '../../../core/_state/country/country.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css'
})
export class EditProfile implements OnInit {
  form!: FormGroup;
  isSubmitting = false;

  // Dial Code Lookups
  dialCodeList: any[] = [];
  dialCodePage = 1;
  dialCodeTotalPages = 1;
  searchDialCodeText = '';
  searchDialCodeSubject = new Subject<string>();
  selectedDialCodeLabel = '';
  lookupLimit = 10;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditProfile>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private userService: UserService,
    private countryService: CountryService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForm();
    
    this.searchDialCodeSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchDialCodeText = searchText;
      this.dialCodePage = 1;
      this.dialCodeList = [];
      this.loadDialCodeLookup();
    });

    this.loadDialCodeLookup();
    this.patchFormData();
  }

  initForm(): void {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', [Validators.required]],
      mobileNo: ['', [Validators.required]],
      birthYear: ['', [Validators.required, Validators.min(1900), Validators.max(2100)]],
      dialCodeId: [null, [Validators.required]]
    });
  }

  patchFormData(): void {
    if (this.data) {
      this.form.patchValue({
        firstName: this.data.firstName,
        lastName: this.data.lastName,
        email: this.data.email,
        gender: (this.data.gender || '').toLowerCase(),
        mobileNo: this.data.mobileNo,
        birthYear: this.data.birthYear,
        dialCodeId: this.data.dialCodeId
      });
      this.selectedDialCodeLabel = this.data.dialCode || '';
    }
  }

  // ── Dial Code Lookup ─────────────────────────────────────────────────────
  loadDialCodeLookup() {
    const params: any = { PageNumber: this.dialCodePage, Limit: this.lookupLimit };
    if (this.searchDialCodeText) {
      params.SearchText = this.searchDialCodeText;
    }

    this.countryService.dialCodeLookup(params).subscribe({
      next: (res: any) => {
        if (res && res.data) {
          const items = res.data.items || res.data;
          this.dialCodeList = [...items];
          this.dialCodeTotalPages = res.data.totalPages || 1;
          
          if (this.form.value.dialCodeId && !this.selectedDialCodeLabel) {
            const found = this.dialCodeList.find(c => c.dialCodeId == this.form.value.dialCodeId);
            if (found) this.selectedDialCodeLabel = found.dialCode;
          }
        }
        this.cdr.markForCheck();
      }
    });
  }

  onDialCodeSearch(event: any) {
    this.searchDialCodeSubject.next(event.target.value);
  }

  onPrevDialCodePage(event: Event) {
    event.stopPropagation();
    if (this.dialCodePage > 1) {
      this.dialCodePage--;
      this.dialCodeList = [];
      this.loadDialCodeLookup();
    }
  }

  onNextDialCodePage(event: Event) {
    event.stopPropagation();
    if (this.dialCodePage < this.dialCodeTotalPages) {
      this.dialCodePage++;
      this.dialCodeList = [];
      this.loadDialCodeLookup();
    }
  }

  selectDialCode(item: any) {
    this.form.patchValue({ dialCodeId: item.dialCodeId });
    this.selectedDialCodeLabel = item.dialCode;
  }
  // ────────────────────────────────────────────────────────────────────────

  close(): void {
    this.dialogRef.close(false);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    // We stringify birthYear if necessary, but the payload structure indicates it's a string
    const payload = { ...this.form.value };
    payload.birthYear = String(payload.birthYear);

    this.userService.updateCurrentUser(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.statusCode === 200 || res.statusCode === 201 || res.status === 'success') {
          this.toastService.success('Profile updated successfully', 'Success');
          this.dialogRef.close(true);
        } else {
          // If the backend wraps the update payload or returns different status maps
          this.toastService.success('Profile updated', 'Success');
          this.dialogRef.close(true);
        }
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        // Toast intercepted globally usually, but stop spinner anyway
        this.isSubmitting = false;
      }
    });
  }
}
