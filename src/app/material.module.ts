import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatMenuModule } from '@angular/material/menu';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AddEditProgramActionComponent } from './pages/program-action/add-edit-program-action/add-edit-program-action.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    DragDropModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatPaginatorModule,
    MatSortModule,
    MatMenuModule,
    DragDropModule
  ],
})
export class MaterialModule { }
