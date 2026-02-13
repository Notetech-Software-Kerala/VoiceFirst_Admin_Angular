import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { Location, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService } from '../../../core/_state/menu/menu.service';
import { PlatformModel, PlatformService } from '../../../core/_state/platform/platform.service';
import { ProgramService } from '../../../core/_state/program/program.service';
import { ProgramModel } from '../../../core/_state/program/program.model';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MasterMenuModel } from '../../../core/_state/menu/menu.model';

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
  originalData!: any; // Using any because MasterMenuModel might not strictly match the full response with programs

  platformList: PlatformModel[] = [];
  programList: any[] = [];
  primaryProgramId: number | null = null;

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private menuService: MenuService,
    private platformService: PlatformService,
    private programService: ProgramService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.formInItialize();
    this.loadLookups();
  }

  formInItialize() {
    this.form = this.fb.group({
      menuName: ['', Validators.required],
      icon: ['', Validators.required],
      route: [''],
      plateFormId: [null, Validators.required],
      web: [false],
      app: [false],
      programIds: this.fb.array([]) // Checkboxes for programs
    });
  }

  loadLookups() {
    forkJoin({
      platforms: this.platformService.lookup(),
      programs: this.programService.lookup()
    }).pipe(
      switchMap(data => {
        this.platformList = data.platforms.data;
        this.programList = data.programs.data; // Assuming lookup returns list of programs
        return this.route.params;
      }),
      switchMap(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.menuId = +params['id'];
          return this.menuService.getById(this.menuId);
        }
        return of(null);
      })
    ).subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.originalData = response.data;
          console.log(this.originalData);

          this.patchForm(response.data);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
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
      programFormArray.push(this.fb.control(programId));
      if (programFormArray.length === 1) {
        this.primaryProgramId = programId;
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
    return programFormArray.controls.some(x => x.value === programId);
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
      this.toastService.warning('Please select a primary program.');
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

    const programsPayload = (formValue.programIds as number[]).map(id => ({
      programId: id,
      primary: id === this.primaryProgramId
    }));

    const payload = {
      menuName: formValue.menuName,
      icon: formValue.icon,
      route: formValue.route,
      plateFormId: formValue.plateFormId,
      web: formValue.web,
      app: formValue.app,
      programIds: programsPayload
    };

    console.log('Add Payload:', payload);

    this.menuService.create(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 200 || res.statusCode === 201) {
          this.toastService.success('Menu created successfully');
          this.goBack();
        } else {
          this.toastService.error(res.message || 'Operation failed');
        }
      },
      error: (err) => {
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
      this.toastService.info('No changes detected');
      this.submitting = false;
      return;
    }

    console.log('Update Payload:', changes);

    this.menuService.update(this.menuId, changes).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.statusCode === 200) {
          this.toastService.success('Menu updated successfully');
          this.goBack();
        } else {
          this.toastService.error(res.message || 'Operation failed');
        }
      },
      error: (err) => {
        this.submitting = false;
      }
    });
  }
}
