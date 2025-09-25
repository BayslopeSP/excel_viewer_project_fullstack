import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { Sheet } from '../../../models/excel-sheet.model';

interface Cell {
  value: string | null;
  hyperlink?: string | null;
  bold?: boolean;
  italic?: boolean;
  fill_color?: string;
  font_color?: string | null;
}
@Component({
  selector: 'app-secondary',
  imports: [CommonModule, FormsModule, MatTableModule],
  templateUrl: './secondary.component.html',
  styleUrl: './secondary.component.scss',
})
export class SecondaryComponent implements OnChanges {
  expandedAbstractRows: Set<number> = new Set();
  expandedFamilyRows: Set<number> = new Set();
  @Input() sheet?: Sheet;
  tableData: any[] = [];

  //  @Input() sheet?: Sheet;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sheet'] && this.sheet?.rows) {
      // Optional: You can handle or process incoming sheet data here if needed
    }
  }

  get safeSheet(): Sheet {
    if (!this.sheet) {
      throw new Error('Sheet is undefined but accessed in template');
    }
    return this.sheet;
  }

  /**
   * Returns headers from row index 4
   */
  getHeaders(): string[] {
    const headerRow = this.sheet?.rows?.[4] ?? [];
    return headerRow.map((cell) => cell?.value?.toString() ?? '');
  }

  /**
   * Returns all data rows starting after header (index > 4)
   */
  getDataRows(): Cell[][] {
    return this.sheet?.rows?.slice(5) ?? [];
  }

  /**
   * Utility: Get cell value safely (fallback to empty string)
   */
  getCellValueSafe(row: number, col: number): string {
    const rowData = this.safeSheet.rows[row];
    return rowData?.[col]?.value ?? '';
  }
  // Show only first 5 lines or 300 characters (you can adjust)
  getAbstractPreview(value: string | null): string {
    if (!value) return '';
    const lines = value.split('\n');
    if (lines.length > 5) {
      return lines.slice(0, 5).join('\n');
    }
    return value.length > 300 ? value.slice(0, 300) + '...' : value;
  }

  isAbstractLong(value: string | null): boolean {
    if (!value) return false;
    return value.split('\n').length > 5 || value.length > 300;
  }

  toggleAbstract(rowIndex: number): void {
    if (this.expandedAbstractRows.has(rowIndex)) {
      this.expandedAbstractRows.delete(rowIndex);
    } else {
      this.expandedAbstractRows.add(rowIndex);
    }
  }
  // expandedFamilyRows: Set<number> = new Set();

  getFamilyPreview(value: string | null): string {
    if (!value) return '';
    const members = value.split('|');
    if (members.length > 5) {
      return members.slice(0, 5).join('|') + '|';
    }
    return value;
  }

  isFamilyLong(value: string | null): boolean {
    if (!value) return false;
    return value.split('|').length > 5;
  }

  toggleFamily(rowIndex: number): void {
    if (this.expandedFamilyRows.has(rowIndex)) {
      this.expandedFamilyRows.delete(rowIndex);
    } else {
      this.expandedFamilyRows.add(rowIndex);
    }
  }
}
