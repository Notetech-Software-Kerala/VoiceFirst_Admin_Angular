import { ChangeDetectorRef, Component } from '@angular/core';
import { ProgramModel } from '../../core/_state/program/program.model';
import { Observable, Subject, takeUntil } from 'rxjs';
import { QueryParameterModel } from '../../core/_models/query-parameter.model';
import { FilterBy, FilterOption } from '../../partials/shared_modules/filter-by/filter-by';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { ConfirmationService } from '../../partials/shared_directives/confirmation';
import { UtilityService } from '../../partials/shared_services/utility.service';
import { ProgramService } from '../../core/_state/program/program.service';
import { ToastService } from '../../partials/shared_services/toast.service';
import { selectAllPrograms, selectProgramLoading, selectProgramTotalCount, selectProgramTotalPages } from '../../core/_state/program/program.selectors';
import { ProgramActions } from '../../core/_state/program/program.action';
import { SortableColumnDirective, SortEvent } from '../../partials/shared_directives/sortable-column';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { Pagination } from '../../partials/shared_modules/pagination/pagination';
import { SearchBar } from '../../partials/shared_modules/search-bar/search-bar';
import { StatusBadge } from '../../partials/shared_modules/status-badge/status-badge';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-program',
  imports: [RouterOutlet],
  templateUrl: './program.html',
  styleUrl: './program.css',
})
export class Program {

}
