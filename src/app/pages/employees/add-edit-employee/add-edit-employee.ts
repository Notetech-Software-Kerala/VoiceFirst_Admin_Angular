import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { EmployeeService } from '../../../core/_state/employee/employee.service';
import { RoleService } from '../../../core/_state/role/role.service';
import { CountryService } from '../../../core/_state/country/country.service';
import { EmployeeModel } from '../../../core/_state/employee/employee.model';
import { RoleModel } from '../../../core/_state/role/role.model';
import { CommonModule, Location } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-add-edit-employee',
  imports: [CommonModule, MaterialModule],
  templateUrl: './add-edit-employee.html',
  styleUrl: './add-edit-employee.css',
})
export class AddEditEmployee implements OnInit, OnDestroy {
  form!: FormGroup;
  isEditMode = false;
  employeeId!: number;
  submitting = false;
  originalData!: EmployeeModel;

  roleList: RoleModel[] = [];

  // Dial Code Lookup state
  dialCodeList: any[] = [];
  selectedDialCodeLabel: string = '';
  searchDialCodeText: string = '';
  searchDialCodeSubject = new Subject<string>();
  dialCodePage = 1;
  dialCodeTotalPages = 1;
  readonly lookupLimit = 10;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private employeeService: EmployeeService,
    private roleService: RoleService,
    private countryService: CountryService,
    private toastService: ToastService,
    private encryptionService: EncryptionService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.formInItialize();

    // Debounced search for dial codes
    this.searchDialCodeSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(text => {
      this.searchDialCodeText = text;
      this.dialCodePage = 1;
      this.dialCodeList = [];
      this.loadDialCodeLookup();
    });

    this.loadDialCodeLookup();
    this.loadRoles();
  }

  formInItialize() {
    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', [Validators.required]],
      mobileNo: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      birthYear: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      dialCodeId: ['', [Validators.required]],
      roleIds: this.fb.array([])
    });
  }

  // ── Dial Code Lookup ─────────────────────────────────────────────────────

  loadDialCodeLookup() {
    const params: any = { PageNumber: this.dialCodePage, Limit: this.lookupLimit };
    if (this.searchDialCodeText) {
      params.SearchText = this.searchDialCodeText;
    }

    this.countryService.dialCodeLookup(params).subscribe({
      next: (res: any) => {
        console.log(res);

        if (res && res.data) {
          const items = res.data.items || res.data;
          this.dialCodeList = [...items];
          this.dialCodeTotalPages = res.data.totalPages || 1;
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

  // ── Role Lookup ──────────────────────────────────────────────────────────

  loadRoles() {
    this.roleService.lookup().subscribe({
      next: (res: any) => {
        if (res && res.data) {
          this.roleList = res.data.items || res.data;
          this.populateRolesFormArray();
          this.loadData();
        }
      }
    });
  }

  populateRolesFormArray() {
    const roleFormArray = this.form.get('roleIds') as FormArray;
    roleFormArray.clear();
    this.roleList.forEach(() => roleFormArray.push(new FormControl(false)));
  }

  get rolesArray() {
    return this.form.get('roleIds') as FormArray;
  }

  // ── Load Employee for Edit ───────────────────────────────────────────────

  loadData() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        const decryptedId = this.encryptionService.decryptFromRoute(params['id']);
        if (decryptedId) {
          this.isEditMode = true;
          this.employeeId = +decryptedId;
          this.employeeService.getById(this.employeeId).subscribe({
            next: (res: any) => {
              if (res && res.data) {
                console.log("original Data", res);

                this.originalData = res.data;
                this.patchForm(this.originalData);
              }
            }
          });
        } else {
          this.toastService.error('Invalid Employee ID', 'Error');
          this.goBack();
        }
      }
    });
  }

  patchForm(data: any) {
    this.form.patchValue({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      gender: data.gender,
      mobileNo: data.mobileNo,
      birthYear: data.birthYear,
      dialCodeId: data.dialCodeId,
    });

    // Restore selected dial code label
    if (data.dialCodeId) {
      const match = this.dialCodeList.find(d => d.dialCodeId === data.dialCodeId);
      if (match) {
        this.selectedDialCodeLabel = match.dialCode;
      }
    }

    // Patch Roles
    // Try all common field names the API might return roles under
    const rawRoles: any[] =
      data.employeeRoles ||
      data.roles ||
      data.userRoles ||
      data.assignedRoles ||
      [];

    // Only pre-check roles that are currently active
    const selectedRoleIds = rawRoles
      .filter((r: any) => r.active !== false)   // keep active: true OR active: undefined
      .map((r: any) => r.roleId);

    console.log('[patchForm] active roleIds to pre-check:', selectedRoleIds);

    if (selectedRoleIds.length > 0) {
      this.roleList.forEach((role, index) => {
        this.rolesArray.at(index).setValue(selectedRoleIds.includes(role.roleId));
      });
    }

    this.cdr.markForCheck();
  }


  // ── Navigation / Utility ─────────────────────────────────────────────────

  goBack() {
    this.location.back();
  }

  get title(): string {
    return this.isEditMode ? 'Edit Employee' : 'Add Employee';
  }

  // ── Submit ───────────────────────────────────────────────────────────────

  onSubmit() {
    if (this.form.invalid) {
      this.toastService.error('Please fill all the required fields', 'Error');
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    if (this.isEditMode) {
      this.editEmployee();
    } else {
      this.addEmployee();
    }
  }

  getSelectedRoleIds(): number[] {
    return this.form.value.roleIds
      .map((checked: boolean, i: number) => checked ? this.roleList[i].roleId : null)
      .filter((v: any) => v !== null);
  }

  addEmployee() {
    const payload = {
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      email: this.form.value.email,
      gender: this.form.value.gender,
      mobileNo: String(this.form.value.mobileNo),
      birthYear: Number(this.form.value.birthYear),
      dialCodeId: Number(this.form.value.dialCodeId),
      roleIds: this.getSelectedRoleIds()
    };

    this.employeeService.create(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 201 || res.statusCode === 200) {
          this.toastService.success('Employee created successfully', 'Success');
          this.router.navigate(['/employees/list']);
        } else {
          this.toastService.error(res.message || 'Operation failed', 'Error');
        }
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

  editEmployee() {
    const formValue = this.form.value;

    // --- Scalar field diff ---
    const changes = this.getChangedValues(formValue, this.originalData);

    // --- Role diff ---
    const currentSelectedRoleIds = this.getSelectedRoleIds();

    const rawRoles: any[] =
      this.originalData.roles ||
      (this.originalData as any).userRoles ||
      (this.originalData as any).assignedRoles ||
      [];

    const originalActiveRoleIds: number[] = rawRoles
      .filter((r: any) => r.active !== false)
      .map((r: any) => r.roleId);

    const insertRoles = currentSelectedRoleIds.filter(id => !originalActiveRoleIds.includes(id));
    const updateRoles = originalActiveRoleIds
      .filter(id => !currentSelectedRoleIds.includes(id))
      .map(id => ({ roleId: id, active: false }));

    if (insertRoles.length > 0) {
      changes.insertRoles = insertRoles;
    }
    if (updateRoles.length > 0) {
      changes.updateRoles = updateRoles;
    }

    // --- Guard: nothing changed ---
    if (Object.keys(changes).length === 0) {
      this.toastService.info('No changes detected', 'Info');
      this.submitting = false;
      return;
    }

    console.log('Update Employee Payload:', changes);

    this.employeeService.update(this.employeeId, changes).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 200) {
          this.toastService.success('Employee updated successfully', 'Success');
          const encryptedId = this.encryptionService.encrypt(res.data.employeeId || this.employeeId);
          this.router.navigate(['/employees/details', encryptedId]);
        } else {
          this.toastService.error(res.message || 'Operation failed', 'Error');
        }
      },
      error: () => {
        this.submitting = false;
      }
    });
  }

  /**
   * Compares the current form values against the originalData and returns
   * only the fields that have changed (scalar fields only — roles are handled separately).
   */
  getChangedValues(formValue: any, original: any): any {
    const changes: any = {};

    // Map form control names to the corresponding original data field names
    const fieldMap: { [formKey: string]: string } = {
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      gender: 'gender',
      mobileNo: 'mobileNo',
      birthYear: 'birthYear',
      dialCodeId: 'dialCodeId',
    };

    Object.entries(fieldMap).forEach(([formKey, originalKey]) => {
      const currentVal = formValue[formKey];
      const originalVal = original[originalKey];

      // Normalize types for a fair comparison
      const normalizedCurrent = currentVal !== null && currentVal !== undefined ? String(currentVal) : '';
      const normalizedOriginal = originalVal !== null && originalVal !== undefined ? String(originalVal) : '';

      if (normalizedCurrent !== normalizedOriginal) {
        // Send in correct types
        if (formKey === 'dialCodeId' || formKey === 'birthYear') {
          changes[formKey] = Number(currentVal);
        } else {
          changes[formKey] = currentVal;
        }
      }
    });

    return changes;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

