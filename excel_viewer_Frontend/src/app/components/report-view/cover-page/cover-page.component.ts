import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportViewComponent } from '../report-view.component';
import { Sheet } from '../../../models/excel-sheet.model';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-cover-page',
  imports: [CommonModule,FormsModule,ReactiveFormsModule,MatCardModule, MatTableModule, MatCheckboxModule],
  templateUrl: './cover-page.component.html',
  styleUrl: './cover-page.component.scss'
})
export class CoverPageComponent {
  @Input() sheet!: Sheet;
}
