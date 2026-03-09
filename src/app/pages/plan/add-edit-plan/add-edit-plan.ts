import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { PlanService } from '../../../core/_state/plan/plan.service';
import { ProgramActionService } from '../../../core/_state/program-action/program-action.service';
import { ProgramActionModel } from '../../../core/_state/program-action/program-action.model';
import { MaterialModule } from '../../../material.module';
import { ProgramService } from '../../../core/_state/program/program.service';
import { ProgramLookupModel } from '../../../core/_state/program/program.model';


import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { SearchBar } from '../../../partials/shared_modules/search-bar/search-bar';

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
  dataLoaded = false;

  searchProgramText: string = '';
  searchSubject = new Subject<string>();

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 1;

  private actionPageCache = new Map<number, { items: ProgramLookupModel[], totalCount: number, totalPages: number }>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private toastService: ToastService,
    private planService: PlanService,
    private programService: ProgramService,
    private encryptionService: EncryptionService
  ) {
    this.form = this.fb.group({
      planName: ['', [Validators.required]],
      active: [true],
      actionIds: this.fb.array([]) // Stores selected actionLinkIds
    });
  }

  ngOnInit(): void {
    const encryptedId = this.route.snapshot.paramMap.get('id');
    if (encryptedId) {
      const decryptedId = this.encryptionService.decryptFromRoute(encryptedId);
      if (decryptedId) {
        this.isEditMode = true;
        this.planId = +decryptedId;
      } else {
        this.toastService.error('Invalid Plan ID', 'Error');
        this.goBack();
      }
    }

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchProgramText = searchText;
      this.currentPage = 1; // reset to 1 on search
      this.loadActions();
    });

    this.loadActions();
  }

  onSearchPrograms(event: any) {
    this.searchSubject.next(event.target.value);
  }

  loadActions() {
    // If there is a search text, we might want to bypass local page cache 
    // or key cache off both page AND search term. For simplicity, if searching,
    // let's clear the cache or create a composite key.
    const cacheKey = `${this.currentPage}_${this.searchProgramText}`;
    const cached = this.actionPageCache.get(cacheKey as any);
    if (cached) {
      this.actionList = cached.items;
      console.log("ActionList");

      this.totalCount = cached.totalCount;
      this.totalPages = cached.totalPages;
      return;
    }

    const params: any = { PageNumber: this.currentPage, PageSize: this.pageSize };

    // Add search parameters
    if (this.searchProgramText) {
      // API expects merely SearchText without SearchBy mappings
      params.SearchText = this.searchProgramText;
    }

    this.programService.lookupForPlan(params).subscribe({
      next: (res) => {

        console.log("API Calling To load Action :::::::::");

        const items = res?.data?.items || [];
        const totalCount = res?.data?.totalCount || 0;
        const totalPages = res?.data?.totalPages || 1;

        if (items.length === 0 && totalPages > 0 && this.currentPage > totalPages) {
          this.currentPage = totalPages;
          this.loadActions();
          return;
        }

        this.actionPageCache.set(cacheKey as any, { items, totalCount, totalPages });

        this.actionList = items;
        this.totalCount = totalCount;
        this.totalPages = totalPages;

        if (this.isEditMode && !this.dataLoaded) {
          this.loadPlanData();
          this.dataLoaded = true;
        }
      }
    });
  }

  onPrevPage(event: Event) {
    event.preventDefault();
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadActions();
    }
  }

  onNextPage(event: Event) {
    event.preventDefault();
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadActions();
    }
  }

  loadPlanData() {
    this.planService.getById(this.planId).subscribe({
      next: (res) => {
        if (res.data) {
          this.originalData = res.data;
          this.patchForm(res.data);
        }
      },
      error: (error) => {
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

  onActionChange(event: Event, actionId?: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.toggleAction(actionId, isChecked);
  }

  toggleAction(actionId: number | undefined, isChecked: boolean) {
    if (actionId == null) {
      return;
    }
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

  isChecked(actionId: number | undefined): boolean {
    if (actionId == null) {
      return false;
    }
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
          this.toastService.success('Plan created successfully', 'Success');
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

  editPlan() {
    const changes = this.getChangedValues(this.form.value, this.originalData);

    if (Object.keys(changes).length === 0) {
      this.toastService.info('No changes detected', 'Info');
      this.submitting = false;
      return;
    }

    this.planService.update(this.planId, changes).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 200) {
          this.toastService.success('Plan updated successfully', 'Success');
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
