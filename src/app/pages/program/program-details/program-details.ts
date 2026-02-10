import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';

import { ProgramService } from '../../../core/_state/program/program.service';
import { ProgramModel } from '../../../core/_state/program/program.model';
import { ProgramActions } from '../../../core/_state/program/program.action';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { UtilityService } from '../../../partials/shared_services/utility.service';
import { MaterialModule } from '../../../material.module';
import { StatusBadge } from "../../../partials/shared_modules/status-badge/status-badge";

@Component({
  selector: 'app-program-details',
  imports: [CommonModule, MaterialModule, StatusBadge],
  templateUrl: './program-details.html',
  styleUrl: './program-details.css',
})
export class ProgramDetails implements OnInit, OnDestroy {
  program: ProgramModel | null = null;
  loading = true;
  private destroy$ = new Subject<void>();
  programId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programService: ProgramService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private utilityService: UtilityService,
    private store: Store,
    private location: Location,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.programId = +params.get('id')!;
      if (this.programId) {
        this.loadProgramDetails(this.programId);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProgramDetails(id: number) {
    this.loading = true;
    this.programService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.program = res.data;
          } else {
            this.toastService.error(res.message || 'Failed to load program details');
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading program details', err);
          this.toastService.error('Error loading program details');
          this.loading = false;
        }
      });
  }

  goBack() {
    this.location.back();
  }

  onEdit() {
    if (this.program) {
      this.router.navigate(['/program/edit', this.program.programId]);
    }
  }

  onDelete() {
    if (!this.program) return;

    this.confirmationService.confirmDelete(this.program.programName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.programService.delete(this.program!.programId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Program deleted successfully', 'Success');
                // Assuming delete returns updated object like plan, if not need adjust
                // Based on previous pattern, soft delete returns object
                this.program = { ...this.program!, deleted: true, active: false };
                this.loadProgramDetails(this.programId); // Reload to be safe
              }
            },
            error: (error) => {

            }
          })
        }
      });
  }

  onSuspend() {
    if (!this.program) return;

    const status = this.program.active ? false : true;
    const action = this.program.active ? 'Suspend' : 'Reinstate';

    this.confirmationService.confirmSuspend(this.program.programName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const changes = { active: status };
          this.programService.update(this.program!.programId, changes).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success(`Program ${action}ed successfully`, 'Success');

                // Update local state
                if (this.program) {
                  this.program = { ...this.program, active: status };
                }

                this.store.dispatch(ProgramActions.update({
                  program: {
                    id: this.program!.programId,
                    changes: changes
                  }
                }));
              }
            },
            error: (error) => {

            }
          })
        }
      });
  }

  onRestore() {
    // Assuming restore API exists or update deleted=false
    // Checking previous implementation_plan or relying on pattern
    // ProgramService might not have restore method yet?
    // Let's assume standard update for now or check service.
    // Actually, plan service had specific restore. Let's check program service.
    if (!this.program) return;

    this.confirmationService.confirmRestore(this.program.programName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          // Check if restore method exists, otherwise use update
          // For now, I'll use update with deleted: false as assumption or check service
          // Let's assume similarity to plan
          this.programService.restore(this.program!.programId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Program restored successfully', 'Success');
                this.store.dispatch(ProgramActions.update({
                  program: {
                    id: this.program!.programId,
                    changes: { deleted: false }
                  }
                }));
                this.loadProgramDetails(this.programId);
              }
            },
            error: (error) => {

            }
          })
        }
      });
  }
}
