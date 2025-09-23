import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
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
  selector: 'app-biblio',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule],
  templateUrl: './biblio.component.html',
  styleUrl: './biblio.component.scss',
})
export class BiblioComponent {
  expandedCells: { [key: string]: boolean } = {};
  @Input() sheet?: Sheet;

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
  getColumnClass(header: string): string {
    const wideColumns = [
      
      'Original Assignees',
      'Normalized Original Assignees',
      // 'Current Assignees',
      'Normalized Current Assignees',
      'Family ID',
    ];

    const narrowColumns = ['Abstract', 'Family Members'];

    if (wideColumns.includes(header.trim())) {
      return 'wide-column';
    } else if (narrowColumns.includes(header.trim())) {
      return 'narrow-column';
    } else {
      return '';
    }
  }
  isCellExpanded(rowIndex: number, colIndex: number): boolean {
    return !!this.expandedCells[`${rowIndex}_${colIndex}`];
  }

  expandCell(event: Event, rowIndex: number, colIndex: number) {
    event.preventDefault();
    this.expandedCells[`${rowIndex}_${colIndex}`] = true;
  }

  collapseCell(event: Event, rowIndex: number, colIndex: number) {
    event.preventDefault();
    this.expandedCells[`${rowIndex}_${colIndex}`] = false;
  }

  getShortText(text: string | null): string {
    if (!text) return '';
    if (typeof text !== 'string') text = String(text);
    const lines = text.split(/\s+/);
    if (lines.length > 50) {
      // 10 words * 5 lines
      return this.getWordWrappedText(lines.slice(0, 50).join(' '), 10);
    }
    return this.getWordWrappedText(text, 10);
  }

  isTextLong(text: string | null): boolean {
    if (!text) return false;
    if (typeof text !== 'string') text = String(text);
    return text.split(/\s+/).length > 50;
  }
  getWordWrappedText(text: string | null, wordsPerLine: number = 5): string {
    if (!text) return '';
    if (typeof text !== 'string') text = String(text);
    const words = text.split(/\s+/);
    let lines: string[] = [];
    for (let i = 0; i < words.length; i += wordsPerLine) {
      lines.push(words.slice(i, i + wordsPerLine).join(' '));
    }
    return lines.join('\n');
  }
}
