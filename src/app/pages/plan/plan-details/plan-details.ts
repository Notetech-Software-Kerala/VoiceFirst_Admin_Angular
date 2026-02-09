import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { PlanService } from '../../../core/_state/plan/plan.service';
import { PlanModel } from '../../../core/_state/plan/plan.model';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { PlanActions } from '../../../core/_state/plan/plan.action';
import { MaterialModule } from '../../../material.module';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { Location } from '@angular/common';
@Component({
  selector: 'app-plan-details',
  imports: [CommonModule, MaterialModule, StatusBadge],
  templateUrl: './plan-details.html',
  styleUrl: './plan-details.css',
})
export class PlanDetails implements OnInit, OnDestroy {
  plan: PlanModel | null = null;
  loading = true;
  private destroy$ = new Subject<void>();
  planId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planService: PlanService,
    private dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private utilityService: UtilityService,
    private store: Store,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.planId = +params.get('id')!;
      if (this.planId) {
        this.loadPlanDetails(this.planId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPlanDetails(id: number) {
    this.loading = true;
    this.planService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.plan = res.data;
          } else {
            this.toastService.error(res.message || 'Failed to load plan details');
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading plan details', err);
          this.toastService.error('Error loading plan details');
          this.loading = false;
        }
      });
  }

  goBack() {
    this.location.back();
  }

  onEdit() {
    if (this.plan) {
      this.router.navigate(['/plan/edit', this.plan.planId]);
    }
  }

  onDelete() {
    if (!this.plan) return;

    this.confirmationService.confirmDelete(this.plan.planName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.planService.delete(this.plan!.planId).subscribe({
            next: (res) => {
              console.log(res);

              if (res.statusCode === 200) {
                this.toastService.success('Plan deleted successfully', 'Success');
                this.plan = res.data;
              }
            },
            error: (error) => {
              this.toastService.error(error.message || 'Failed to delete plan');
            }
          })
        }
      });
  }

  onSuspend() {
    if (!this.plan) return;

    const status = this.plan.active ? false : true;
    const action = this.plan.active ? 'Suspend' : 'Reinstate';

    this.confirmationService.confirmSuspend(this.plan.planName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const changes = { active: status };
          this.planService.update(this.plan!.planId, changes).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success(`Plan ${action}ed successfully`, 'Success');

                // Update local state
                if (this.plan) {
                  this.plan = { ...this.plan, active: status };
                }

                this.store.dispatch(PlanActions.update({
                  plan: {
                    id: this.plan!.planId,
                    changes: changes
                  }
                }));
              }
            },
            error: (error) => {
              this.toastService.error(error.message || `Failed to ${action} plan`);
            }
          })
        }
      });
  }

  onRestore() {
    if (!this.plan) return;

    this.confirmationService.confirmRestore(this.plan.planName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.planService.restore(this.planId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Plan restored successfully', 'Success');
                this.store.dispatch(PlanActions.update({
                  plan: {
                    id: this.plan!.planId,
                    changes: { deleted: false }
                  }
                }));
                this.loadPlanDetails(this.planId);
              }
            },
            error: (error) => {
              this.toastService.error(error.message || 'Failed to restore plan');
            }
          })
        }
      });
  }
}
