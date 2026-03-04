import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { PostOfficeModel, ZipCode } from '../../../core/_state/post-office/post-office.model';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { PostOfficeService } from '../../../core/_state/post-office/post-office.service';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { Store } from '@ngrx/store';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { MaterialModule } from '../../../material.module';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { DetailsLoaderComponent } from '../../../partials/shared_modules/details-loader/details-loader.component';
import { FormsModule } from '@angular/forms';
import { PostOfficeActions } from '../../../core/_state/post-office/post-office.action';

@Component({
  selector: 'app-post-office-details',
  imports: [CommonModule, MaterialModule, StatusBadge, DetailsLoaderComponent, FormsModule],
  templateUrl: './post-office-details.html',
  styleUrl: './post-office-details.css',
})
export class PostOfficeDetails implements OnInit, OnDestroy {
  postOffice: PostOfficeModel | null = null;
  loading = true;
  private destroy$ = new Subject<void>();
  postOfficeId: number = 0;

  searchText: string = '';
  filteredZipCodes: ZipCode[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private postOfficeService: PostOfficeService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    public utilityService: UtilityService,
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
          this.postOfficeId = +decryptedId;
          this.loadPostOfficeDetails(this.postOfficeId);
        } else {
          this.toastService.error('Invalid Post Office ID', 'Error');
          this.goBack();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPostOfficeDetails(id: number) {
    this.loading = true;
    this.postOfficeService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.postOffice = res.data;
            console.log(this.postOffice);

            this.filteredZipCodes = this.postOffice?.zipCodes || [];
          } else {
            this.toastService.error(res.message || 'Failed to load post office details', 'Error');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading post office details', error);
          this.loading = false;
        }
      });
  }

  applyFilters() {
    if (!this.postOffice || !this.postOffice.zipCodes) {
      this.filteredZipCodes = [];
      return;
    }

    this.filteredZipCodes = this.postOffice.zipCodes.filter(z => {
      return !this.searchText || z.zipCode?.toLowerCase().includes(this.searchText.toLowerCase());
    });
  }

  goBack() {
    this.location.back();
  }

  onEdit() {
    if (this.postOffice) {
      const encryptedId = this.encryptionService.encryptForRoute(this.postOffice.postOfficeId);
      this.router.navigate(['/post-office/edit', encryptedId]);
    }
  }

  onDelete() {
    if (!this.postOffice) return;

    this.confirmationService.confirmDelete(this.postOffice.postOfficeName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.postOfficeService.delete(this.postOffice!.postOfficeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Post Office deleted successfully', 'Success');
                this.postOffice = { ...this.postOffice!, deleted: true, active: false };
                this.loadPostOfficeDetails(this.postOfficeId);
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
    if (!this.postOffice) return;

    const status = !this.postOffice.active;
    const action = this.postOffice.active ? 'Suspend' : 'Reinstate';

    this.confirmationService.confirmSuspend(this.postOffice.postOfficeName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const changes = { active: status };
          this.postOfficeService.update(this.postOffice!.postOfficeId, changes).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success(`Post Office ${action}ed successfully`, 'Success');

                if (this.postOffice) {
                  this.postOffice = { ...this.postOffice, active: status };
                }

                this.store.dispatch(PostOfficeActions.update({
                  postOffice: {
                    id: this.postOffice!.postOfficeId,
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
    if (!this.postOffice) return;

    this.confirmationService.confirmRestore(this.postOffice.postOfficeName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.postOfficeService.restore(this.postOffice!.postOfficeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Post Office restored successfully', 'Success');
                this.store.dispatch(PostOfficeActions.update({
                  postOffice: {
                    id: this.postOffice!.postOfficeId,
                    changes: { deleted: false }
                  }
                }));
                this.loadPostOfficeDetails(this.postOfficeId);
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
