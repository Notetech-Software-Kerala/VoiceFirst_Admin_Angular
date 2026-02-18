import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaceService } from '../../../core/_state/place/place.service';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { PlaceModel } from '../../../core/_state/place/place.model';
import { of, switchMap } from 'rxjs';

@Component({
  selector: 'app-add-edit-place',
  imports: [CommonModule, MaterialModule],
  templateUrl: './add-edit-place.html',
  styleUrl: './add-edit-place.css',
})
export class AddEditPlace implements OnInit {
  form!: FormGroup;
  isEditMode = false;
  placeId!: number;
  submitting = false;
  originalData!: PlaceModel;

  constructor(
    private location: Location,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private placeService: PlaceService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.formInItialize();
    this.loadData();
  }

  formInItialize() {
    this.form = this.fb.group({
      placeName: ['', Validators.required]
    });
  }

  loadData() {
    this.route.params.pipe(
      switchMap(params => {
        if (params['id']) {
          const decryptedId = this.encryptionService.decryptFromRoute(params['id']);
          if (decryptedId) {
            this.isEditMode = true;
            this.placeId = +decryptedId;
            return this.placeService.getById(this.placeId);
          } else {
            this.toastService.error('Invalid Place ID', 'Error');
            this.goBack();
            return of(null);
          }
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

  patchForm(data: any) {
    this.form.patchValue({
      placeName: data.placeName
    });
  }

  goBack() {
    this.location.back();
  }

  get title(): string {
    return this.isEditMode ? 'Edit Place' : 'Add Place';
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;

    if (this.isEditMode) {
      this.editPlace();
    } else {
      this.addPlace();
    }
  }

  addPlace() {
    if (this.form.valid) {
      const payload = {
        placeName: this.form.value.placeName
      };

      this.placeService.create(payload).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.statusCode === 200 || res.statusCode === 201) {
            this.toastService.success('Place created successfully', 'Success');
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

  editPlace() {
    if (this.form.valid) {
      const changes = this.getChangedValues(this.form.value, this.originalData);

      if (Object.keys(changes).length === 0) {
        this.toastService.info('No changes detected', 'Info');
        this.submitting = false;
        return;
      }

      this.placeService.update(this.placeId, changes).subscribe({
        next: (res) => {
          this.submitting = false;
          if (res.statusCode === 200) {
            this.toastService.success('Place updated successfully', 'Success');
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

  getChangedValues(formValue: any, originalData: PlaceModel): any {
    const changes: any = {};

    if (formValue.placeName !== originalData.placeName) {
      changes.placeName = formValue.placeName;
    }

    return changes;
  }
}
