import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { IssueTypeService } from '../../../../core/_state/issue/issue-type/issue-type.service';
import { IssueTypeModel } from '../../../../core/_state/issue/issue-type/issue-type.model';
import { IssueTypeActions } from '../../../../core/_state/issue/issue-type/issue-type.action';
import { ConfirmationService } from '../../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../../partials/shared_services/toast.service';
import { MaterialModule } from '../../../../material.module';
import { StatusBadge } from '../../../../partials/shared_modules/status-badge/status-badge';
import { Location } from '@angular/common';
import { EncryptionService } from '../../../../partials/shared_services/encryption.service';
import { DetailsLoaderComponent } from '../../../../partials/shared_modules/details-loader/details-loader.component';

@Component({
  selector: 'app-issue-type-details',
  standalone: true,
  imports: [CommonModule, MaterialModule, StatusBadge, DetailsLoaderComponent],
  templateUrl: './issue-type-details.html',
  styleUrl: './issue-type-details.css',
})
export class IssueTypeDetails implements OnInit, OnDestroy {
  issueType: IssueTypeModel | null = null;
  loading = true;
  private destroy$ = new Subject<void>();
  issueTypeId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private issueTypeService: IssueTypeService,
    private dialog: MatDialog,
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
          this.issueTypeId = +decryptedId;
          this.loadDetails(this.issueTypeId);
        } else {
          this.toastService.error('Invalid Issue Type ID', 'Error');
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
    this.issueTypeService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.issueType = res.data;
          } else {
            this.toastService.error(res.message || 'Failed to load issue type details', 'Error');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading issue type details', error);
          this.loading = false;
        }
      });
  }

  goBack() {
    this.location.back();
  }

  onEdit() {
    if (this.issueType) {
      const encryptedId = this.encryptionService.encryptForRoute(this.issueType.issueTypeId);
      this.router.navigate(['/issue-type/edit', encryptedId]);
    }
  }

  onDelete() {
    if (!this.issueType) return;

    this.confirmationService.confirmDelete(this.issueType.issueType)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.issueTypeService.delete(this.issueType!.issueTypeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Issue Type deleted successfully', 'Success');
                this.issueType = { ...this.issueType!, ...(res as any)?.data, deleted: true };
              }
            },
            error: (error) => { }
          });
        }
      });
  }

  onSuspend() {
    if (!this.issueType) return;

    const status = this.issueType.active ? false : true;
    const action = this.issueType.active ? 'Suspend' : 'Reinstate';

    this.confirmationService.confirmSuspend(this.issueType.issueType, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const changes = { active: status };
          this.issueTypeService.update(this.issueType!.issueTypeId, changes).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success(`Issue Type ${action}ed successfully`, 'Success');

                if (this.issueType) {
                  this.issueType = { ...this.issueType, active: status };
                }

                this.store.dispatch(IssueTypeActions.update({
                  issueTypes: {
                    id: this.issueType!.issueTypeId,
                    changes: changes
                  }
                }));
              }
            },
            error: (error) => { }
          });
        }
      });
  }

  onRestore() {
    if (!this.issueType) return;

    this.confirmationService.confirmRestore(this.issueType.issueType)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.issueTypeService.restore(this.issueTypeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Issue Type restored successfully', 'Success');
                this.store.dispatch(IssueTypeActions.update({
                  issueTypes: {
                    id: this.issueType!.issueTypeId,
                    changes: { deleted: false }
                  }
                }));
                this.loadDetails(this.issueTypeId);
              }
            },
            error: (error) => { }
          });
        }
      });
  }
}
