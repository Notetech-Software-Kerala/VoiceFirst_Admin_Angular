import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { PlatformModel, PlatformService } from '../../../core/_state/platform/platform.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../../core/_state/role/role.service';
import { PlanService } from '../../../core/_state/plan/plan.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { forkJoin, of, switchMap } from 'rxjs';
import { CommonModule, Location } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { PlanModel } from '../../../core/_state/plan/plan.model';
import { createPlanActionLink, updatePlanActionLinks, RoleModel } from '../../../core/_state/role/role.model';

@Component({
  selector: 'app-add-edit-role',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './add-edit-role.html',
  styleUrl: './add-edit-role.css',
})
export class AddEditRole implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  roleId!: number;
  submitting = false;
  originalData!: RoleModel;

  platformList: PlatformModel[] = [];
  planList: PlanModel[] = [];

  // Plans that the user has added to the role
  // For Edit mode, this includes existing plans + new ones
  selectedPlans: ExtendedPlanModel[] = [];

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private roleService: RoleService,
    private platformService: PlatformService,
    private planService: PlanService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.formInItialize();
    this.loadLookups();
  }

  formInItialize() {
    this.form = this.fb.group({
      roleName: ['', Validators.required],
      rolePurpose: [''],
      platformId: [null, Validators.required],
      selectedPlanId: [null] // Control for the dropdown to select a plan to add
    });
  }

  loadLookups() {
    forkJoin({
      platforms: this.platformService.lookup(),
      plans: this.planService.lookup()
    }).pipe(
      switchMap(data => {
        this.platformList = (data.platforms.data as any) || [];
        this.planList = (data.plans.data as any) || [];
        return this.route.params;
      }),
      switchMap(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.roleId = +params['id'];
          // We need to fetch FULL role details with plans/actions if getById provides it.
          // Assuming getById returns the structure with rolePlanDetails
          return this.roleService.getById(this.roleId);
        }
        return of(null);
      })
    ).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.originalData = response.data;
          this.patchForm(response.data);
        }
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  patchForm(data: RoleModel) {
    this.form.patchValue({
      roleName: data.roleName,
      rolePurpose: data.rolePurpose,
      platformId: data.platformId
    });

    if (data.planRoleActionLink) {
      const requests = data.planRoleActionLink.map(link =>
        this.planService.getById(link.planId).pipe(switchMap(res => of({
          planDetails: res.data,
          roleLink: link
        })))
      );

      if (requests.length > 0) {
        forkJoin(requests).subscribe(results => {
          results.forEach(item => {
            const plan = item.planDetails;
            const roleLink = item.roleLink;

            if (plan) {
              const extendedPlan: ExtendedPlanModel = {
                ...plan,
                isExisting: true,
                rolePlanLinkId: roleLink.planRoleLinkId,
                selectedActions: new Set<number>()
              };

              // Pre-select actions that are active in the role
              if (roleLink.planActionLink) {
                roleLink.planActionLink.forEach(a => {
                  if (a.active) extendedPlan.selectedActions.add(a.actionLinkId);
                });
              }

              this.selectedPlans.push(extendedPlan);
            }
          });
        });
      }
    }
  }

  onAddPlan() {
    const planId = this.form.get('selectedPlanId')?.value;
    if (!planId) return;

    // Check if already added
    if (this.selectedPlans.some(p => p.planId == planId)) {
      this.toastService.warning('Plan already added', 'Warning');
      return;
    }

    this.planService.getById(planId).subscribe({
      next: (res) => {
        if (res.data) {
          const plan = res.data;
          const extendedPlan: ExtendedPlanModel = {
            ...plan,
            isExisting: false,
            selectedActions: new Set<number>()
          };
          this.selectedPlans.push(extendedPlan);
          this.form.get('selectedPlanId')?.setValue(null);
        }
      },
      error: (error) => this.toastService.error('Failed to load plan details', 'Error')
    });
  }

  removePlan(index: number) {
    this.selectedPlans.splice(index, 1);
  }

  toggleAction(plan: ExtendedPlanModel, actionId: number, isChecked: boolean) {
    if (isChecked) {
      plan.selectedActions.add(actionId);
    } else {
      plan.selectedActions.delete(actionId);
    }
  }

  isActionSelected(plan: ExtendedPlanModel, actionId: number): boolean {
    return plan.selectedActions.has(actionId);
  }

  goBack() {
    this.location.back();
  }

  get title(): string {
    return this.isEditMode ? 'Edit Role' : 'Add Role';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    if (this.isEditMode) {
      this.editRole();
    } else {
      this.addRole();
    }
  }

  addRole() {
    const formValue = this.form.value;

    const createPlanActionLink: createPlanActionLink[] = this.selectedPlans.map(p => ({
      planId: p.planId,
      actionLinkIds: Array.from(p.selectedActions)
    }));

    const payload = {
      roleName: formValue.roleName,
      rolePurpose: formValue.rolePurpose,
      platformId: formValue.platformId,
      createPlanActionLink: createPlanActionLink
    };

    console.log('Add Role Payload:', payload);

    this.roleService.create(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.toastService.success('Role created successfully', 'Success');
          this.goBack();
        } else {
          this.toastService.error(res.message || 'Operation failed', 'Error');
        }
      },
      error: (error) => {
        this.submitting = false;
      }
    });
  }

  editRole() {
    const formValue = this.form.value;
    const original = this.originalData;
    const changes = this.getChangedValues(formValue, original);

    // List of new plans
    const newPlans = this.selectedPlans.filter(p => !p.isExisting);
    const newPlanPayloads: createPlanActionLink[] = newPlans.map(p => ({
      planId: p.planId,
      actionLinkIds: Array.from(p.selectedActions)
    }));

    // Existing Plans Payload Arrays
    const existingPlanNewActions: createPlanActionLink[] = [];
    const updateActionLinks: updatePlanActionLinks[] = [];

    const existingPlans = this.selectedPlans.filter(p => p.isExisting);

    existingPlans.forEach(p => {
      // Find original linkage info using planRoleActionLink
      const originalLink = original.planRoleActionLink?.find(d => d.planId === p.planId);
      if (!originalLink) return;

      const allActions = new Set<number>();
      if (p.programPlanDetails) {
        p.programPlanDetails.forEach((ppd: any) => {
          if (ppd.actions) {
            ppd.actions.forEach((a: any) => {
              // Fallback logic for ID
              allActions.add(a.actionLinkId || a.actionId);
            });
          }
        });
      }

      const newActionsForPlan: number[] = [];
      const updates: any[] = [];

      allActions.forEach(actionId => {
        const isSelected = p.selectedActions.has(actionId);

        // Check original state
        const originalAction = originalLink.planActionLink.find(oa => oa.actionLinkId === actionId);

        if (!originalAction) {
          // Action was NOT in original role definition -> NEW ACTION for Existing Plan
          if (isSelected) {
            newActionsForPlan.push(actionId);
          }
        } else {
          // Action was in original role definition -> UPDATE Existing Action
          const wasSelected = originalAction.active;
          if (isSelected !== wasSelected) {
            updates.push({
              actionLinkId: actionId,
              active: isSelected
            });
          }
        }
      });

      // Add to respective payloads
      if (newActionsForPlan.length > 0) {
        existingPlanNewActions.push({
          planId: p.planId,
          actionLinkIds: newActionsForPlan
        });
      }

      if (updates.length > 0) {
        updateActionLinks.push({
          rolePlanLinkId: p.rolePlanLinkId!,
          updateActionLinks: updates
        });
      }
    });

    // Merge New Plan Payloads + Existing Plan New Actions
    if (newPlanPayloads.length > 0 || existingPlanNewActions.length > 0) {
      changes.createPlanActionLink = [...newPlanPayloads, ...existingPlanNewActions];
    }

    if (updateActionLinks.length > 0) {
      changes.updatePlanActionLinks = updateActionLinks;
    }

    if (Object.keys(changes).length === 0) {
      this.toastService.info('No changes detected', 'Info');
      this.submitting = false;
      return;
    }

    console.log('Update Role Payload:', changes);

    this.roleService.update(this.roleId, changes).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 200) {
          this.toastService.success('Role updated successfully', 'Success');
          this.goBack();
        } else {
          this.toastService.error(res.message || 'Operation failed', 'Error');
        }
      },
      error: (error) => {
        this.submitting = false;
      }
    });
  }

  getChangedValues(formValue: any, original: any): any {
    const changes: any = {};
    Object.keys(formValue).forEach(key => {
      if (key === 'selectedPlanId') return;

      const currentValue = formValue[key];
      const originalValue = original[key];

      // Robust comparison
      if (currentValue !== originalValue) {
        // Treat null and undefined as equal
        if ((currentValue === null || currentValue === undefined) && (originalValue === null || originalValue === undefined)) {
          return;
        }
        // Treat empty string and null/undefined as equal (common in forms)
        if (currentValue === '' && (originalValue === null || originalValue === undefined)) {
          return;
        }

        changes[key] = currentValue;
      }
    });
    return changes;
  }
}

// Helper inteface to track UI state
interface ExtendedPlanModel extends PlanModel {
  isExisting: boolean; // True if it was already part of the role
  rolePlanLinkId?: number; // Only for existing
  selectedActions: Set<number>;
}
