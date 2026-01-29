import { Component, ChangeDetectorRef } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { Location, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramService } from '../../../core/_state/program/program.service';
import { CompanyService, CompanyModel } from '../../../core/_state/company/company.service';

import { ProgramActionModel } from '../../../core/_state/program-action/program-action.model';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { map, switchMap, forkJoin, of } from 'rxjs';
import { ProgramActionService } from '../../../core/_state/program-action/program-action.service';
import { ProgramModel } from '../../../core/_state/program/program.model';
import { PlatformModel, PlatformService } from '../../../core/_state/platform/platform.service';

@Component({
  selector: 'app-add-edit-program',
  imports: [MaterialModule, CommonModule],
  templateUrl: './add-edit-program.html',
  styleUrl: './add-edit-program.css',
})
export class AddEditProgram {

  form!: FormGroup;
  isEditMode = false;
  programId!: number;
  submitting = false;
  originalData!: ProgramModel;

  companyList: CompanyModel[] = [];
  platformList: PlatformModel[] = [];
  programActionList: ProgramActionModel[] = [];

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private programService: ProgramService,
    private companyService: CompanyService,
    private programActionService: ProgramActionService,
    private platformService: PlatformService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.formInItialize();
    this.loadLookups();
  }

  formInItialize() {
    this.form = this.fb.group({
      programName: ['', Validators.required],
      label: ['', Validators.required],
      route: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9](.*[A-Za-z0-9])?$')]],
      platformId: [null, Validators.required],
      companyId: [null],
      actionIds: this.fb.array([]) // Initialize as FormArray for checkboxes
    });
  }

  loadLookups() {
    forkJoin({
      // companies: this.companyService.lookup(),
      platforms: this.platformService.lookup(),
      actions: this.programActionService.lookup()
    }).pipe(
      switchMap(data => {
        // this.companyList = data.companies.data;
        this.platformList = data.platforms.data;
        this.programActionList = data.actions.data;

        return this.route.params;
      }),
      switchMap(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.programId = +params['id'];
          return this.programService.getById(this.programId);
        }
        return of(null);
      })
    ).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.originalData = response.data;

          if (this.isEditMode && response.data.action) {
            const existingIds = new Set(this.programActionList.map(a => a.actionId));
            response.data.action.forEach((programAction: ProgramActionModel) => {
              if (!existingIds.has(programAction.actionId)) {
                this.programActionList.push(programAction);
                existingIds.add(programAction.actionId);
              }
            });
            // Optional: Sort by name so they appear integrated
            this.programActionList.sort((a, b) => a.actionName.localeCompare(b.actionName));
          }

          this.patchForm(response.data);
        }
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Failed to load data.');
      }
    });
  }

  patchForm(data: any) {
    this.form.patchValue({
      programName: data.programName,
      label: data.label,
      route: data.route,
      platformId: data.platformId,
      companyId: data.companyId
    });

    // Handle actionIds Checkboxes
    // Select only those actions that are marked ACTIVE in the fetched program data
    const activeActions = data.action
      ? data.action.filter((a: any) => a.active === true)
      : [];

    const activeActionIds = activeActions.map((a: any) => a.actionId);

    // If we have action data, use that. Otherwise fallback to actionIds if present (e.g. from create payload simulation)
    const idsToCheck = data.action ? activeActionIds : (data.actionIds || []);

    this.programActionList.forEach(action => {
      if (idsToCheck.includes(action.actionId)) {
        this.toggleAction(action.actionId, true);
      }
    });

  }


  // Helper to manage Checkbox array manually if using FormControl<number[]> is tricky with standard inputs
  // Or better, keep actionIds as an array control.

  onActionChange(event: Event, actionId: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.toggleAction(actionId, isChecked);
  }

  toggleAction(actionId: number, isChecked: boolean) {
    const actionFormArray = this.form.get('actionIds') as FormArray;
    if (isChecked) {
      actionFormArray.push(this.fb.control(actionId));
    } else {
      const index = actionFormArray.controls.findIndex(x => x.value === actionId);
      if (index !== -1) {
        actionFormArray.removeAt(index);
      }
    }
  }

  isChecked(actionId: number): boolean {
    const actionFormArray = this.form.get('actionIds') as FormArray;
    return actionFormArray.controls.some(x => x.value === actionId);
  }

  goBack() {
    this.location.back();
  }

  get title(): string {
    return this.isEditMode ? 'Edit Program' : 'Add Program';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    if (this.isEditMode) {
      this.editProgram();
    } else {
      this.addProgram();
    }
  }

  addProgram() {
    if (this.form.valid) {
      const payload = {
        programName: this.form.value.programName,
        label: this.form.value.label,
        route: this.form.value.route,
        platformId: this.form.value.platformId,
        companyId: this.form.value.companyId,
        actionIds: this.form.value.actionIds // Already array of numbers
      };

      this.programService.create(payload).subscribe({
        next: (res) => {
          this.submitting = false;
          // Backend returns 200 or 201 for functionality success
          if (res.statusCode === 200 || res.statusCode === 201) {
            this.toastService.success('Program created successfully');
            this.goBack();
          } else {
            this.toastService.error(res.message || 'Operation failed');
          }
        },
        error: (err) => {
          this.submitting = false;
          this.toastService.error(err.message || 'An error occurred');
        }
      });
    }
  }

  editProgram() {
    if (this.form.valid) {
      const changes = this.getChangedValues(this.form.value, this.originalData);

      if (Object.keys(changes).length === 0) {
        this.toastService.info('No changes detected');
        this.submitting = false;
        return;
      }

      console.log("Update payload", changes);

      this.programService.update(this.programId, changes).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.statusCode === 200) {
            this.toastService.success('Program updated successfully');
            this.goBack();
          } else {
            this.toastService.error(res.message || 'Operation failed');
          }
        },
        error: (err) => {
          this.submitting = false;
          this.toastService.error(err.message || 'An error occurred');
        }
      });
    }
  }

  getChangedValues(formValue: any, originalData: ProgramModel): any {
    const changes: any = {};

    if (formValue.programName !== originalData.programName) {
      changes.programName = formValue.programName;
    }

    if (formValue.label !== originalData.label) {
      changes.label = formValue.label;
    }

    if (formValue.route !== originalData.route) {
      changes.route = formValue.route;
    }

    if (formValue.platformId !== originalData.platformId) {
      changes.platformId = formValue.platformId;
    }

    if (formValue.companyId !== originalData.companyId) {
      changes.companyId = formValue.companyId;
    }

    // Advanced Action Update Logic
    const originalActionMap = new Map<number, boolean>();
    originalData.action?.forEach(a => originalActionMap.set(a.actionId, a.active));

    const currentActionIds = new Set<number>(formValue.actionIds);

    const insertActions: number[] = [];
    const updateActions: { actionId: number, active: boolean }[] = [];

    // Calculate Insertions (Present in Form, Not in Original)
    currentActionIds.forEach(id => {
      if (!originalActionMap.has(id)) {
        insertActions.push(id);
      }
    });

    // Calculate Updates (Present in Original, Status Changed)
    originalActionMap.forEach((wasActive, id) => {
      const isSelected = currentActionIds.has(id);

      // Case 1: Was Active, Now Unchecked -> Deactivate
      if (wasActive && !isSelected) {
        updateActions.push({ actionId: id, active: false });
      }

      // Case 2: Was Inactive, Now Checked -> Activate
      if (!wasActive && isSelected) {
        updateActions.push({ actionId: id, active: true });
      }
    });

    if (insertActions.length > 0) {
      changes.insertActions = insertActions;
    }

    if (updateActions.length > 0) {
      changes.updateActions = updateActions;
    }

    return changes;
  }
}
