import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';

import { BusinessActivityService } from '../../../core/_state/business-activity/business-activity.service';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { MaterialModule } from '../../../material.module';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { DetailsLoaderComponent } from '../../../partials/shared_modules/details-loader/details-loader.component';
import { BusinessActivityModel } from '../../../core/_state/business-activity/business-activity.model';

@Component({
  selector: 'app-business-activity-details',
  standalone: true,
  imports: [CommonModule, MaterialModule, StatusBadge, DetailsLoaderComponent],
  templateUrl: './business-activity-details.html',
  styleUrl: './business-activity-details.css',
})
export class BusinessActivityDetails implements OnInit, OnDestroy {
  item: BusinessActivityModel | null = null;
  loading = true;
  private destroy$ = new Subject<void>();
  activityId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private businessActivityService: BusinessActivityService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private store: Store,
    private location: Location,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const encryptedId = params.get('id');
      if (encryptedId) {
        const decryptedId = this.encryptionService.decryptFromRoute(encryptedId);
        if (decryptedId) {
          this.activityId = +decryptedId;
          this.loadDetails(this.activityId);
        } else {
          this.toastService.error('Invalid Business Activity ID', 'Error');
          this.goBack();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDetails(id: number) {
    this.loading = true;
    this.businessActivityService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res.statusCode === 200 && res.data) {
            this.item = res.data;
          } else {
            this.toastService.error(res.message || 'Failed to load details', 'Error');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading details', error);
          this.loading = false;
        }
      });
  }

  goBack() {
    this.location.back();
  }

  onEdit() {
    if (this.item) {
      const encryptedId = this.encryptionService.encryptForRoute(this.item.activityId);
      this.router.navigate(['/business-activity/edit', encryptedId]);
    }
  }

  onDelete() {
    if (!this.item) return;

    this.confirmationService.confirmDelete(this.item.activityName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.businessActivityService.delete(this.item!.activityId).subscribe({
            next: (res: any) => {
              if (res.statusCode === 200) {
                this.toastService.success('Business Activity deleted successfully', 'Success');
                this.goBack();
              }
            },
            error: (error) => { }
          })
        }
      });
  }

  onSuspend() {
    if (!this.item) return;

    const status = !this.item.active;
    const action = this.item.active ? 'Suspend' : 'Reinstate';

    this.confirmationService.confirmSuspend(this.item.activityName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const changes = { active: status };
          this.businessActivityService.update(this.item!.activityId, changes).subscribe({
            next: (res: any) => {
              if (!res || res.statusCode === 200 || res.statusCode === 204) {
                this.toastService.success(`Business Activity ${action}ed successfully`, 'Success');

                // Update local state
                if (this.item) {
                  this.item = { ...this.item, active: status };
                }
              }
            },
            error: (error) => { }
          })
        }
      });
  }

  onRestore() {
    if (!this.item) return;

    this.confirmationService.confirmRestore(this.item.activityName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.businessActivityService.restore(this.activityId).subscribe({
            next: (res: any) => {
              if (res.statusCode === 200) {
                this.toastService.success('Business Activity recovered successfully', 'Success');
                this.loadDetails(this.activityId);
              }
            },
            error: (error) => { }
          })
        }
      });
  }
}
