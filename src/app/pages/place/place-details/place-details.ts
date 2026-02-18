import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { PlaceModel } from '../../../core/_state/place/place.model';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaceService } from '../../../core/_state/place/place.service';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { PlaceActions } from '../../../core/_state/place/place.action';
import { MaterialModule } from '../../../material.module';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { DetailsLoaderComponent } from '../../../partials/shared_modules/details-loader/details-loader.component';

@Component({
  selector: 'app-place-details',
  imports: [CommonModule, MaterialModule, StatusBadge, DetailsLoaderComponent],
  templateUrl: './place-details.html',
  styleUrl: './place-details.css',
})
export class PlaceDetails implements OnInit, OnDestroy {
  place: PlaceModel | null = null;
  loading = true;
  private destroy$ = new Subject<void>();
  placeId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private placeService: PlaceService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    public utilityService: UtilityService,
    private store: Store,
    private location: Location,
    private dialog: MatDialog,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const encryptedId = params.get('id');
      if (encryptedId) {
        const decryptedId = this.encryptionService.decryptFromRoute(encryptedId);
        if (decryptedId) {
          this.placeId = +decryptedId;
          this.loadPlaceDetails(this.placeId);
        } else {
          this.toastService.error('Invalid Place ID', 'Error');
          this.goBack();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPlaceDetails(id: number) {
    this.loading = true;
    this.placeService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.place = res.data;
          } else {
            this.toastService.error(res.message || 'Failed to load place details', 'Error');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading place details', error);
          this.loading = false;
        }
      });
  }

  goBack() {
    this.location.back();
  }

  onEdit() {
    if (this.place) {
      const encryptedId = this.encryptionService.encryptForRoute(this.place.placeId);
      this.router.navigate(['/place/edit', encryptedId]);
    }
  }

  onDelete() {
    if (!this.place) return;

    this.confirmationService.confirmDelete(this.place.placeName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.placeService.delete(this.place!.placeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Place deleted successfully', 'Success');
                this.place = { ...this.place!, deleted: true, active: false };
                this.loadPlaceDetails(this.placeId);
              }
            },
            error: (error) => {
              console.error(error);
            }
          })
        }
      });
  }

  onSuspend() {
    if (!this.place) return;

    const status = this.place.active ? false : true;
    const action = this.place.active ? 'Suspend' : 'Reinstate';

    this.confirmationService.confirmSuspend(this.place.placeName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const changes = { active: status };
          this.placeService.update(this.place!.placeId, changes).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success(`Place ${action}ed successfully`, 'Success');

                // Update local state
                if (this.place) {
                  this.place = { ...this.place, active: status };
                }

                this.store.dispatch(PlaceActions.update({
                  place: {
                    id: this.place!.placeId,
                    changes: changes
                  }
                }));
              }
            },
            error: (error) => {
              console.error(error);
            }
          })
        }
      });
  }

  onRestore() {
    if (!this.place) return;

    this.confirmationService.confirmRestore(this.place.placeName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.placeService.restore(this.place!.placeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Place restored successfully', 'Success');
                this.store.dispatch(PlaceActions.update({
                  place: {
                    id: this.place!.placeId,
                    changes: { deleted: false }
                  }
                }));
                this.loadPlaceDetails(this.placeId);
              }
            },
            error: (error) => {
              console.error(error);
            }
          })
        }
      });
  }
}
