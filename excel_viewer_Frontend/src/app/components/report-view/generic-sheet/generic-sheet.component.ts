import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Sheet } from '../../../models/excel-sheet.model';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-generic-sheet',
  imports: [MatCardModule, MatTableModule, MatCheckboxModule, CommonModule],
  templateUrl: './generic-sheet.component.html',
  styleUrl: './generic-sheet.component.scss'
})
export class GenericSheetComponent {
  @Input() sheet!: Sheet;

  @Output() checkboxClicked = new EventEmitter<number>();

  getSheetIdFromHyperlink(link: string | null): number {
    if (!link) return -1;
    const match = link.match(/\/(\d+)\/?$/);
    return match ? +match[1] : -1;
  }

  handleCheckboxClick(link: string | null) {
    const sheetId = this.getSheetIdFromHyperlink(link);
    if (sheetId > 0) this.checkboxClicked.emit(sheetId);
  }
}
