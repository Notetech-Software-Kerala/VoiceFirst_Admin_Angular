import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { PostOfficeModel } from '../../core/_state/post-office/post-office.model';
import { Observable, takeUntil } from 'rxjs';
import { FilterBy, FilterOption } from '../../partials/shared_modules/filter-by/filter-by';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ConfirmationService } from '../../partials/shared_directives/confirmation';
import { UtilityService } from '../../partials/shared_services/utility.service';
import { PostOfficeService } from '../../core/_state/post-office/post-office.service';
import { ToastService } from '../../partials/shared_services/toast.service';
import { selectAllPostOffices, selectPostOfficeLoading, selectPostOfficeTotalCount, selectPostOfficeTotalPages } from '../../core/_state/post-office/post-office.selectors';
import { PostOfficeActions } from '../../core/_state/post-office/post-office.action';
import { AddEditPostOffice } from './add-edit-post-office/add-edit-post-office';
import { SortableColumnDirective } from '../../partials/shared_directives/sortable-column';
import { MaterialModule } from '../../material.module';
import { StatusBadge } from "../../partials/shared_modules/status-badge/status-badge";
import { SearchBar } from '../../partials/shared_modules/search-bar/search-bar';
import { Pagination } from '../../partials/shared_modules/pagination/pagination';
import { BaseListComponent } from '../../core/base/base-list.component';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { EncryptionService } from '../../partials/shared_services/encryption.service';

@Component({
  selector: 'app-post-office',
  imports: [RouterOutlet],
  templateUrl: './post-office.html',
  styleUrl: './post-office.css',
})
export class PostOffice {
}
