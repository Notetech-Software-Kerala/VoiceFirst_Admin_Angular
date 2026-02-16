import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil, switchMap, forkJoin, of, map, catchError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { RoleService } from '../../../core/_state/role/role.service';
import { PlanService } from '../../../core/_state/plan/plan.service'; // Added
import { RoleModel } from '../../../core/_state/role/role.model';
import { RoleActions } from '../../../core/_state/role/role.action';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { MaterialModule } from '../../../material.module';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { DetailsLoaderComponent } from '../../../partials/shared_modules/details-loader/details-loader.component';



@Component({
  selector: 'app-role-details',
  standalone: true,
  imports: [CommonModule, MaterialModule, StatusBadge, DetailsLoaderComponent],
  templateUrl: './role-details.html',
  styleUrl: './role-details.css',
})
export class RoleDetails implements OnInit, OnDestroy {
  role: any | null = null;
  loading = true;
  private destroy$ = new Subject<void>();
  roleId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleService: RoleService,
    private planService: PlanService, // Inject PlanService
    private dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private store: Store,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.roleId = +params.get('id')!;
      if (this.roleId) {
        this.loadRoleDetails(this.roleId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRoleDetails(id: number) {
    this.loading = true;
    this.roleService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200 && res.data) {
            this.role = res.data;
          } else {
            this.toastService.error(res.message || 'Failed to load role details');
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading role details', err);
          this.toastService.error('Error loading role details');
          this.loading = false;
        }
      });
  }

  goBack() {
    this.location.back();
  }

  onEdit() {
    if (this.role) {
      this.router.navigate(['/roles/edit', this.role.roleId]);
    }
  }

  onDelete() {
    if (!this.role) return;

    this.confirmationService.confirmDelete(this.role.roleName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.roleService.delete(this.role!.roleId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Role deleted successfully', 'Success');
                this.role = res.data;
                this.store.dispatch(RoleActions.delete({ id: this.roleId }));
                this.goBack(); // Navigate back after delete
              }
            },
            error: (error) => {
              this.toastService.error(error.message || 'Failed to delete role');
            }
          })
        }
      });
  }

  onSuspend() {
    if (!this.role) return;

    const status = !this.role.active;
    const action = this.role.active ? 'Suspend' : 'Reinstate';

    this.confirmationService.confirmSuspend(this.role.roleName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const changes = { active: status };
          this.roleService.update(this.role!.roleId, changes).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success(`Role ${action}ed successfully`, 'Success');

                // Update local state
                if (this.role) {
                  this.role = { ...this.role, active: status };
                }

                this.store.dispatch(RoleActions.update({
                  role: {
                    id: this.role!.roleId,
                    changes: changes
                  }
                }));
              }
            },
            error: (error) => {
              this.toastService.error(error.message || `Failed to ${action} role`);
            }
          })
        }
      });
  }

  onRestore() {
    if (!this.role) return;

    this.confirmationService.confirmRestore(this.role.roleName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.roleService.restore(this.roleId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Role restored successfully', 'Success');
                this.store.dispatch(RoleActions.update({
                  role: {
                    id: this.role!.roleId,
                    changes: { deleted: false }
                  }
                }));
                this.loadRoleDetails(this.roleId);
              }
            },
            error: (error) => {
              this.toastService.error(error.message || 'Failed to restore role');
            }
          })
        }
      });
  }
}
