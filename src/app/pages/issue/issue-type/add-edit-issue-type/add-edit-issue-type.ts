import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { IssueTypeModel } from '../../../../core/_state/issue/issue-type/issue-type.model';
import { ActivatedRoute, Router } from '@angular/router';
import { EncryptionService } from '../../../../partials/shared_services/encryption.service';
import { Store } from '@ngrx/store';
import { IssueTypeService } from '../../../../core/_state/issue/issue-type/issue-type.service';
import { UtilityService } from '../../../../partials/shared_services/utility.service';
import { ToastService } from '../../../../partials/shared_services/toast.service';
import { ConfirmationService } from '../../../../partials/shared_directives/confirmation';
import { MaterialModule } from '../../../../material.module';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { IssueMediaFormatService } from '../../../../core/_state/issue/issue-media-format/issue-media-format.service';
import { IssueMediaTypeService } from '../../../../core/_state/issue/issue-media-type/issue-media-type.service';

@Component({
  selector: 'app-add-edit-issue-type',
  imports: [MaterialModule, ReactiveFormsModule, CommonModule],
  templateUrl: './add-edit-issue-type.html',
  styleUrl: './add-edit-issue-type.css',
})
export class AddEditIssueType implements OnInit {
  form!: FormGroup;
  isSubmitting = false;
  mediaFormats: any[] = [];
  mediaTypes: any[] = [];

  issueTypeId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private issueTypeService: IssueTypeService,
    private issueMediaFormatService: IssueMediaFormatService,
    private issueMediaTypeService: IssueMediaTypeService,
    private utilityService: UtilityService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private route: ActivatedRoute,
    private router: Router,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit() {
    this.formInitialize();
    this.loadLookups();

    this.route.paramMap.subscribe(params => {
      const encryptedId = params.get('id');
      if (encryptedId) {
        this.issueTypeId = Number(this.encryptionService.decryptFromRoute(encryptedId));
        this.loadIssueTypeForEdit();
      }
    });
  }

  loadIssueTypeForEdit() {
    if (this.issueTypeId) {
      this.issueTypeService.getById(this.issueTypeId).subscribe({
        next: (res: any) => {
          if (res.statusCode === 200 && res.data) {
            this.form.patchValue({ issueType: res.data.issueType });

            // Populate media rules if available
            if (res.data.mediaRules && res.data.mediaRules.length > 0) {
              res.data.mediaRules.forEach((rule: any, ruleIndex: number) => {
                this.addMediaRule();
                const ruleGroup = this.mediaRules.at(ruleIndex);
                ruleGroup.patchValue({
                  issueMediaFormatId: rule.issueMediaFormatId,
                  min: rule.min,
                  max: rule.max,
                  maxSizeMB: rule.maxSizeMB
                });

                if (rule.mediaTypes && rule.mediaTypes.length > 0) {
                  rule.mediaTypes.forEach((type: any, typeIndex: number) => {
                    this.addMediaType(ruleIndex);
                    const typeGroup = this.getMediaTypes(ruleIndex).at(typeIndex);
                    typeGroup.patchValue({
                      issueMediaTypeId: type.issueMediaTypeId,
                      isMandatory: type.isMandatory
                    });
                  });
                }
              });
            }
          }
        },
        error: (err: any) => console.log(err)
      });
    }
  }

  formInitialize() {
    this.form = this.fb.group({
      issueType: ['', Validators.required],
      mediaRules: this.fb.array([])
    });
  }

  loadLookups() {
    this.issueMediaFormatService.lookup().subscribe({
      next: (res: any) => {
        this.mediaFormats = res.data || [];
      },
      error: () => { }
    });
    this.issueMediaTypeService.lookup().subscribe({
      next: (res: any) => {
        this.mediaTypes = res.data || [];
      },
      error: () => { }
    });
  }

  get mediaRules(): FormArray {
    return this.form.get('mediaRules') as FormArray;
  }

  getMediaTypes(ruleIndex: number): FormArray {
    return this.mediaRules.at(ruleIndex).get('mediaTypes') as FormArray;
  }

  addMediaRule() {
    const ruleGroup = this.fb.group({
      issueMediaFormatId: [null, Validators.required],
      min: [0, [Validators.required, Validators.min(0)]],
      max: [1, [Validators.required, Validators.min(1)]],
      maxSizeMB: [5, [Validators.required, Validators.min(0.1)]],
      mediaTypes: this.fb.array([])
    });
    this.mediaRules.push(ruleGroup);
  }

  removeMediaRule(index: number) {
    this.mediaRules.removeAt(index);
  }

  addMediaType(ruleIndex: number) {
    const typeGroup = this.fb.group({
      issueMediaTypeId: [null, Validators.required],
      isMandatory: [false]
    });
    this.getMediaTypes(ruleIndex).push(typeGroup);
  }

  removeMediaType(ruleIndex: number, typeIndex: number) {
    this.getMediaTypes(ruleIndex).removeAt(typeIndex);
  }

  goBack(): void {
    this.router.navigate(['/issue-type']);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    if (this.issueTypeId) {
      this.updateIssueType();
    } else {
      this.addIssueType();
    }
  }

  addIssueType() {
    const payload = this.buildPayload();
    this.issueTypeService.create(payload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 201) {
            this.toastService.success('Issue Type added successfully', 'Success');
            this.goBack();
          }
        },
        error: (err) => {
          console.error(err);
          if (err.error?.statusCode === 422) {
            const existingId = err.error.data?.issueTypeId;
            if (existingId) {
              this.restoreIssueType(existingId, this.form.value.issueType);
            }
          }
        }
      });
  }

  updateIssueType() {
    const payload: any = { issueType: this.form.value.issueType };
    if (this.mediaRules.length > 0) {
      payload.mediaRules = this.buildMediaRulesPayload();
    }
    this.issueTypeService.update(this.issueTypeId as number, payload)
      .pipe(finalize(() => this.isSubmitting = false))
      .subscribe({
        next: (res) => {
          if (!res || res.statusCode === 200 || res.statusCode === 204) {
            this.toastService.success('Issue Type updated successfully', 'Success');
            this.goBack();
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  restoreIssueType(id: number, name: string) {
    this.confirmationService.confirmRestore(name, `${name} already exists, do you want to restore it?`).subscribe(confirmed => {
      if (confirmed) {
        this.issueTypeService.restore(id).subscribe({
          next: (res: any) => {
            if (res.statusCode === 200) {
              this.toastService.success('Issue Type restored successfully', 'Success');
              this.goBack();
            }
          },
          error: (err) => console.log('error', err)
        });
      }
    });
  }

  buildPayload() {
    return {
      issueType: this.form.value.issueType,
      mediaRules: this.buildMediaRulesPayload()
    };
  }

  buildMediaRulesPayload() {
    return this.mediaRules.controls.map(rule => ({
      issueMediaFormatId: rule.get('issueMediaFormatId')?.value,
      min: rule.get('min')?.value,
      max: rule.get('max')?.value,
      maxSizeMB: rule.get('maxSizeMB')?.value,
      mediaTypes: (rule.get('mediaTypes') as FormArray).controls.map(t => ({
        issueMediaTypeId: t.get('issueMediaTypeId')?.value,
        isMandatory: t.get('isMandatory')?.value
      }))
    }));
  }

  get f() {
    return this.form.controls;
  }

  get title(): string {
    return this.issueTypeId ? 'Edit Issue Type' : 'Add Issue Type';
  }
}
