import { Component, Input } from '@angular/core';
import { Column } from '../../../models/excel-sheet.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-mappingdetails',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './mappingdetails.component.html',
  styleUrl: './mappingdetails.component.scss'
})
export class MappingdetailsComponent {
  @Input() rows: Column[][] = [];
}