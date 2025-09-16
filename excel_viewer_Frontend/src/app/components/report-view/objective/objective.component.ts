import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { Sheet } from '../../../models/excel-sheet.model';

@Component({
  selector: 'app-objective',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatTableModule, MatCheckboxModule],
  templateUrl: './objective.component.html',
  styleUrl: './objective.component.scss'
})
export class ObjectiveComponent {
  @Input() sheet?: Sheet;

  getCell(row: number, col: number): string {
    const val = this.sheet?.rows?.[row]?.[col]?.value;
    return typeof val === 'string' || typeof val === 'number' ? String(val) : '';
  }
}
