import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Sheet } from '../../../models/excel-sheet.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.scss'
})
export class OverviewComponent implements OnChanges {
  @Input() sheet?: Sheet;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sheet'] && this.sheet?.rows) {
    }
  }



  get safeSheet(): Sheet {
    if (!this.sheet) {
      throw new Error("Sheet is undefined but accessed in template");
    }
    return this.sheet;
  }

  getCellValueSafe(row: number, col: number): string {
    const rowData = this.safeSheet.rows[row];
    return rowData?.[col]?.value ?? '';
  }

}
