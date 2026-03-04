import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { EmployeeModel } from '../../../core/_state/employee/employee.model';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from '../../../core/_state/employee/employee.service';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { Store } from '@ngrx/store';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { MaterialModule } from '../../../material.module';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { DetailsLoaderComponent } from '../../../partials/shared_modules/details-loader/details-loader.component';
import { EmployeeActions } from '../../../core/_state/employee/employee.action';

@Component({
  selector: 'app-employee-details',
  imports: [CommonModule, MaterialModule, StatusBadge, DetailsLoaderComponent],
  templateUrl: './employee-details.html',
  styleUrl: './employee-details.css',
})
export class EmployeeDetails implements OnInit, OnDestroy {
  employee: EmployeeModel | null = null;
  loading = true;
  private destroy$ = new Subject<void>();
  employeeId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
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
          this.employeeId = +decryptedId;
          this.loadEmployeeDetails(this.employeeId);
        } else {
          this.toastService.error('Invalid Employee ID', 'Error');
          this.goBack();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployeeDetails(id: number) {
    this.loading = true;
    this.employeeService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200 && res.data) {
            this.employee = res.data;
          } else {
            this.toastService.error(res.message || 'Failed to load employee details', 'Error');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading employee details', error);
          this.loading = false;
        }
      });
  }

  goBack() {
    this.location.back();
  }

  onEdit() {
    if (this.employee) {
      const encryptedId = this.encryptionService.encryptForRoute(this.employee.employeeId);
      this.router.navigate(['/employees/edit', encryptedId]);
    }
  }

  onDelete() {
    if (!this.employee) return;

    this.confirmationService.confirmDelete(`${this.employee.firstName} ${this.employee.lastName}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.employeeService.delete(this.employee!.employeeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Employee deleted successfully', 'Success');
                this.employee = { ...this.employee!, deleted: true, active: false };
                this.loadEmployeeDetails(this.employeeId);
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
    if (!this.employee) return;

    const status = !this.employee.active;
    const action = this.employee.active ? 'Suspend' : 'Reinstate';

    this.confirmationService.confirmSuspend(`${this.employee.firstName} ${this.employee.lastName}`, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const changes = { active: status };
          this.employeeService.update(this.employee!.employeeId, changes).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success(`Employee ${action}ed successfully`, 'Success');

                if (this.employee) {
                  this.employee = { ...this.employee, active: status };
                }

                this.store.dispatch(EmployeeActions.update({
                  employee: {
                    id: this.employee!.employeeId,
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
    if (!this.employee) return;

    this.confirmationService.confirmRestore(`${this.employee.firstName} ${this.employee.lastName}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.employeeService.restore(this.employee!.employeeId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Employee restored successfully', 'Success');
                this.store.dispatch(EmployeeActions.update({
                  employee: {
                    id: this.employee!.employeeId,
                    changes: { deleted: false }
                  }
                }));
                this.loadEmployeeDetails(this.employeeId);
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
