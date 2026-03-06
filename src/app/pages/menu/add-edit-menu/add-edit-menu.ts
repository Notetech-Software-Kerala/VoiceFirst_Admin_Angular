import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { Location, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from '../../../core/_state/menu/menu.service';
import { PlatformModel, PlatformService } from '../../../core/_state/platform/platform.service';
import { ProgramService } from '../../../core/_state/program/program.service';
import { ProgramLookupModel } from '../../../core/_state/program/program.model';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { forkJoin, of, Subject } from 'rxjs';
import { switchMap, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MasterMenuModel } from '../../../core/_state/menu/menu.model';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';

@Component({
  selector: 'app-add-edit-menu',
  imports: [MaterialModule, CommonModule],
  templateUrl: './add-edit-menu.html',
  styleUrl: './add-edit-menu.css',
})
export class AddEditMenu implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  menuId!: number;
  submitting = false;
  originalData!: any;
  dataLoaded = false;

  platformList: PlatformModel[] = [];

  // Paginated program list
  programList: ProgramLookupModel[] = [];
  primaryProgramId: number | null = null;

  searchProgramText: string = '';
  searchSubject = new Subject<string>();

  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 1;

  private programPageCache = new Map<string, { items: ProgramLookupModel[], totalCount: number, totalPages: number }>();

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private menuService: MenuService,
    private platformService: PlatformService,
    private programService: ProgramService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.formInItialize();

    // Debounced search
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(searchText => {
      this.searchProgramText = searchText;
      this.currentPage = 1;
      this.programPageCache.clear();
      this.loadPrograms();
    });

    this.form.get('route')?.valueChanges.subscribe(val => {
      const hasRoute = !!val?.trim();

      if (hasRoute) {
        if (this.programList.length === 0 && this.totalCount === 0) {
          this.loadPrograms();
        }
      } else {
        this.clearProgramAssociationState();
      }
    });

    this.loadPlatformsAndPrograms();
  }

  get routeHasValue(): boolean {
    const routeVal = this.form.get('route')?.value;
    return routeVal && routeVal.trim() !== '';
  }

  formInItialize() {
    this.form = this.fb.group({
      menuName: ['', Validators.required],
      icon: ['', Validators.required],
      route: [''],
      plateFormId: [null, Validators.required],
      web: [false],
      app: [false],
      programIds: this.fb.array([])
    });
  }

  loadPlatformsAndPrograms() {
    this.platformService.lookup().subscribe({
      next: (res) => {
        this.platformList = res.data;
      },
      error: () => { }
    });

    // We check route via subscription in ngOnInit. 
    // Here we just handle the edit mode check.
    if (!this.dataLoaded) {
      this.route.params.subscribe(params => {
        if (params['id']) {
          const decryptedId = this.encryptionService.decryptFromRoute(params['id']);
          if (decryptedId) {
            this.isEditMode = true;
            this.menuId = +decryptedId;
            if (!this.dataLoaded) {
              this.dataLoaded = true;
              this.loadMenuForEdit();
            }
          } else {
            this.toastService.error('Invalid Menu ID', 'Error');
            this.goBack();
          }
        } else {
          this.dataLoaded = true;
        }
      });
    }
  }

  loadPrograms() {
    if (!this.routeHasValue) return;

    const cacheKey = `${this.currentPage}_${this.searchProgramText}`;
    const cached = this.programPageCache.get(cacheKey);

    if (cached) {
      this.programList = cached.items;
      this.totalCount = cached.totalCount;
      this.totalPages = cached.totalPages;
      return;
    }

    const params: any = {
      PageNumber: this.currentPage,
      Limit: this.pageSize
    };

    if (this.searchProgramText) {
      params.SearchText = this.searchProgramText;
    }

    this.programService.lookup(params).subscribe({
      next: (res) => {
        const pageData = res?.data;

        const items = pageData?.items ?? [];
        const totalCount = pageData?.totalCount ?? 0;
        const totalPages = pageData?.totalPages ?? 1;

        this.programPageCache.set(cacheKey, {
          items,
          totalCount,
          totalPages
        });

        this.programList = items;
        this.totalCount = totalCount;
        this.totalPages = totalPages;
      },
      error: () => {
        this.programList = [];
        this.totalCount = 0;
        this.totalPages = 1;
      }
    });
  }

  private clearProgramAssociationState() {
    const programFormArray = this.form.get('programIds') as FormArray;
    programFormArray.clear();

    this.primaryProgramId = null;
    this.programList = [];
    this.searchProgramText = '';
    this.currentPage = 1;
    this.totalCount = 0;
    this.totalPages = 1;
    this.programPageCache.clear();
  }

  loadMenuForEdit() {
    this.menuService.getById(this.menuId).subscribe({
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

  onSearchPrograms(event: Event) {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  onPrevPage(event: Event) {
    event.preventDefault();
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPrograms();
    }
  }

  onNextPage(event: Event) {
    event.preventDefault();
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadPrograms();
    }
  }

  patchForm(data: any) {
    this.form.patchValue({
      menuName: data.menuName,
      icon: data.icon,
      route: data.route,
      plateFormId: data.plateFormId,
      web: data.web,
      app: data.app
    });

    if (data.programs) {
      data.programs.forEach((p: any) => {
        if (p.active) {
          this.toggleProgram(p.programId, true);
          if (p.primary) {
            this.primaryProgramId = p.programId;
          }
        }
      });
    }
  }

  onProgramChange(event: Event, programId: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.toggleProgram(programId, isChecked);
  }

  toggleProgram(programId: number, isChecked: boolean) {
    const programFormArray = this.form.get('programIds') as FormArray;
    if (isChecked) {
      const exists = programFormArray.controls.some(x => x.value === programId);
      if (!exists) {
        programFormArray.push(this.fb.control(programId));
        if (programFormArray.length === 1) {
          this.primaryProgramId = programId;
        }
      }
    } else {
      const index = programFormArray.controls.findIndex(x => x.value === programId);
      if (index !== -1) {
        programFormArray.removeAt(index);
      }
      if (this.primaryProgramId === programId) {
        this.primaryProgramId = null;
        if (programFormArray.length > 0) {
          this.primaryProgramId = programFormArray.at(0).value;
        }
      }
    }
  }

  setPrimary(programId: number) {
    if (this.isChecked(programId)) {
      this.primaryProgramId = programId;
    }
  }

  isChecked(programId: number): boolean {
    const programFormArray = this.form.get('programIds') as FormArray;
    return programFormArray.controls.some(control => control.value === programId);
  }

  toggleProgramCard(programId: number) {
    const willSelect = !this.isChecked(programId);
    this.toggleProgram(programId, willSelect);

    if (!willSelect && this.primaryProgramId === programId) {
      this.primaryProgramId = null;
    }
  }

  goBack() {
    this.location.back();
  }

  get title(): string {
    return this.isEditMode ? 'Edit Menu' : 'Add Menu';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const programIds = this.form.get('programIds')?.value as number[];
    if (programIds.length > 0 && this.primaryProgramId === null) {
      this.toastService.warning('Please select a primary program.', 'Warning');
      return;
    }

    this.submitting = true;

    if (this.isEditMode) {
      this.editMenu();
    } else {
      this.addMenu();
    }
  }

  addMenu() {
    const formValue = this.form.value;

    const programsPayload = this.routeHasValue
      ? (formValue.programIds as number[]).map(id => ({
        programId: id,
        primary: id === this.primaryProgramId
      }))
      : [];

    const payload = {
      menuName: formValue.menuName,
      icon: formValue.icon,
      route: formValue.route,
      plateFormId: formValue.plateFormId,
      web: formValue.web,
      app: formValue.app,
      programIds: programsPayload
    };

    this.menuService.create(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.toastService.success('Menu created successfully', 'Success');
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

  editMenu() {
    const formValue = this.form.value;
    const original = this.originalData;
    const changes: any = {};

    if (formValue.menuName !== original.menuName) changes.menuName = formValue.menuName;
    if (formValue.icon !== original.icon) changes.icon = formValue.icon;
    if (formValue.route !== original.route) changes.route = formValue.route;
    if (formValue.plateFormId !== original.plateFormId) changes.plateFormId = formValue.plateFormId;
    if (formValue.web !== original.web) changes.web = formValue.web;
    if (formValue.app !== original.app) changes.app = formValue.app;

    // Handle Programs
    const currentIds = new Set(formValue.programIds as number[]);
    const originalProgramMap = new Map<number, any>();
    if (original.programs) {
      original.programs.forEach((p: any) => originalProgramMap.set(p.programId, p));
    }

    const insertPrograms: any[] = [];
    const updatePrograms: any[] = [];

    const allIds = new Set([...Array.from(originalProgramMap.keys()), ...Array.from(currentIds)]);

    allIds.forEach(id => {
      const isSelected = currentIds.has(id);
      const isPrimary = id === this.primaryProgramId;
      const originalP = originalProgramMap.get(id);

      if (!originalP) {
        if (isSelected) {
          insertPrograms.push({ programId: id, primary: isPrimary });
        }
      } else {
        if (isSelected !== originalP.active || (isSelected && (isPrimary !== originalP.primary))) {
          updatePrograms.push({
            programId: id,
            primary: isSelected ? isPrimary : false,
            active: isSelected
          });
        }
      }
    });

    if (insertPrograms.length > 0) changes.programIds = insertPrograms;
    if (updatePrograms.length > 0) changes.updateProgramIds = updatePrograms;

    if (Object.keys(changes).length === 0) {
      this.toastService.info('No changes detected', 'Info');
      this.submitting = false;
      return;
    }

    this.menuService.update(this.menuId, changes).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 200) {
          this.toastService.success('Menu updated successfully', 'Success');
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
}
