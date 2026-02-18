import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';

import { MenuService } from '../../../core/_state/menu/menu.service';
import { MasterMenuModel } from '../../../core/_state/menu/menu.model';
import { ConfirmationService } from '../../../partials/shared_directives/confirmation';
import { ToastService } from '../../../partials/shared_services/toast.service';
import { MaterialModule } from '../../../material.module';
import { StatusBadge } from '../../../partials/shared_modules/status-badge/status-badge';
import { EncryptionService } from '../../../partials/shared_services/encryption.service';
import { DetailsLoaderComponent } from '../../../partials/shared_modules/details-loader/details-loader.component';

@Component({
  selector: 'app-menu-details',
  standalone: true,
  imports: [CommonModule, MaterialModule, StatusBadge, DetailsLoaderComponent],
  templateUrl: './menu-details.html',
  styleUrl: './menu-details.css',
})
export class MenuDetails implements OnInit, OnDestroy {
  menu: MasterMenuModel | null = null;
  loading = true;
  private destroy$ = new Subject<void>();
  menuId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    private dialog: MatDialog,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private location: Location,
    private encryptionService: EncryptionService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const encryptedId = params.get('id');
      if (encryptedId) {
        const decryptedId = this.encryptionService.decryptFromRoute(encryptedId);
        if (decryptedId) {
          this.menuId = +decryptedId;
          this.loadMenuDetails(this.menuId);
        } else {
          this.toastService.error('Invalid Menu ID', 'Error');
          this.goBack();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMenuDetails(id: number) {
    this.loading = true;
    this.menuService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.menu = res.data;
          } else {
            this.toastService.error(res.message || 'Failed to load menu details', 'Error');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading menu details', error);
          this.loading = false;
        }
      });
  }

  goBack() {
    this.location.back();
  }

  onEdit() {
    if (this.menu) {
      const encryptedId = this.encryptionService.encryptForRoute(this.menu.menuId);
      this.router.navigate(['/menu/edit', encryptedId]);
    }
  }

  onDelete() {
    if (!this.menu) return;

    this.confirmationService.confirmDelete(this.menu.menuName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.menuService.delete(this.menu!.menuId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Menu deleted successfully', 'Success');
                this.goBack();
              }
            },
            error: (error) => {
            }
          })
        }
      });
  }

  onSuspend() {
    if (!this.menu) return;

    const status = !this.menu.active;
    const action = this.menu.active ? 'Suspend' : 'Reinstate';

    this.confirmationService.confirmSuspend(this.menu.menuName, status)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          const changes = { active: status };
          this.menuService.updateMasterMenu(this.menu!.menuId, changes).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success(`Menu ${action}ed successfully`, 'Success');
                if (this.menu) {
                  this.menu = { ...this.menu, active: status };
                }
              }
            },
            error: (error) => {
            }
          })
        }
      });
  }

  onRestore() {
    if (!this.menu) return;

    this.confirmationService.confirmRestore(this.menu.menuName)
      .pipe(takeUntil(this.destroy$))
      .subscribe(confirmed => {
        if (confirmed) {
          this.menuService.restoreMasterMenu(this.menuId).subscribe({
            next: (res) => {
              if (res.statusCode === 200) {
                this.toastService.success('Menu restored successfully', 'Success');
                this.loadMenuDetails(this.menuId);
              }
            },
            error: (error) => {
            }
          })
        }
      });
  }
}
