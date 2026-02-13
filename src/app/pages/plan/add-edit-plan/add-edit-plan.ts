import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { PlanService } from '../../../core/_state/plan/plan.service';
import { ProgramActionService } from '../../../core/_state/program-action/program-action.service';
import { ProgramActionModel } from '../../../core/_state/program-action/program-action.model';
import { MaterialModule } from '../../../material.module';
import { ProgramService } from '../../../core/_state/program/program.service';
import { ProgramLookupModel } from '../../../core/_state/program/program.model';


@Component({
  selector: 'app-add-edit-plan',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './add-edit-plan.html',
  styleUrl: './add-edit-plan.css',
})
export class AddEditPlan implements OnInit {
  form: FormGroup;
  isEditMode = false;
  planId: number = 0;
  submitting = false;

  actionList: ProgramLookupModel[] = [];
  originalData: any = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private toastService: ToastService,
    private planService: PlanService,
    private programService: ProgramService
  ) {
    this.form = this.fb.group({
      planName: ['', [Validators.required]],
      active: [true],
      actionIds: this.fb.array([]) // Stores selected actionLinkIds
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.planId = +id;
    }

    this.loadActions();
  }

  loadActions() {
    this.programService.lookupForPlan().subscribe({
      next: (res) => {
        this.actionList = res.data || [];
        if (this.isEditMode) {
          this.loadPlanData();
        }
      },
      error: (err) => {
        this.toastService.error('Failed to load actions');
      }
    });
  }

  loadPlanData() {
    this.planService.getById(this.planId).subscribe({
      next: (res) => {
        if (res.data) {
          this.originalData = res.data;
          this.patchForm(res.data);
        }
      },
      error: (err) => {
        this.toastService.error('Failed to load plan details');
        this.goBack();
      }
    });
  }

  patchForm(data: any) {
    this.form.patchValue({
      planName: data.planName,
      active: data.active
    });

    if (data.programPlanDetails) {
      data.programPlanDetails.forEach((detail: any) => {
        if (detail.actions) {
          detail.actions.forEach((action: any) => {
            // Check if actionId matches any actionLinkId in our lookup list
            // API response for getById likely returns actionId, but lookup has actionLinkId.
            // We need to map them or assume they are the same ID? 
            // Wait, the user JSON showed "actionLinkId": 28.
            // In program detail, it was "actionId".
            // If they match, great. If not, we have a problem.
            // Let's assume actionId in details == actionLinkId in lookup for now, or check detail properties.
            // If detail.actions has actionLinkId, use that.

            const idToSelect = action.actionLinkId || action.actionId;
            if (idToSelect) {
              this.toggleAction(idToSelect, true);
            }
          });
        }
      });
    }
  }

  onActionChange(event: Event, actionId: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.toggleAction(actionId, isChecked);
  }

  toggleAction(actionId: number, isChecked: boolean) {
    const actionFormArray = this.form.get('actionIds') as FormArray;
    if (isChecked) {
      const exists = actionFormArray.controls.some(x => x.value === actionId);
      if (!exists) {
        actionFormArray.push(this.fb.control(actionId));
      }
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
    return this.isEditMode ? 'Edit Plan' : 'Add Plan';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    if (this.isEditMode) {
      this.editPlan();
    } else {
      this.addPlan();
    }
  }

  addPlan() {
    const formValue = this.form.value;
    const payload = {
      planName: formValue.planName,
      programActionLinkIds: formValue.actionIds
    };

    console.log('Add Plan Payload:', payload);

    this.planService.create(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 201) {
          this.toastService.success('Plan created successfully');
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

  editPlan() {
    const changes = this.getChangedValues(this.form.value, this.originalData);

    if (Object.keys(changes).length === 0) {
      this.toastService.info('No changes detected');
      this.submitting = false;
      return;
    }

    this.planService.update(this.planId, changes).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 200) {
          this.toastService.success('Plan updated successfully');
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

  getChangedValues(formValue: any, original: any): any {
    const changes: any = {};

    if (formValue.planName !== original.planName) {
      changes.planName = formValue.planName;
    }
    if (formValue.active !== original.active) {
      changes.active = formValue.active;
    }

    // Handle Action Links
    const originalActionIds = new Set<number>();
    if (original.programPlanDetails) {
      original.programPlanDetails.forEach((d: any) => {
        if (d.actions) {
          d.actions.forEach((a: any) => {
            // Use actionLinkId if available, else actionId
            originalActionIds.add(a.actionLinkId || a.actionId);
          });
        }
      });
    }

    const currentActionIds = new Set<number>(formValue.actionIds);
    const actionLinks: any[] = [];
    const allActionIds = new Set([...Array.from(originalActionIds), ...Array.from(currentActionIds)]);

    allActionIds.forEach(id => {
      const isSelected = currentActionIds.has(id);
      const wasSelected = originalActionIds.has(id);

      if (isSelected !== wasSelected) {
        actionLinks.push({
          programActionLinkId: id,
          active: isSelected
        });
      }
    });

    if (actionLinks.length > 0) {
      changes.actionLinks = actionLinks;
    }

    return changes;
  }

}
