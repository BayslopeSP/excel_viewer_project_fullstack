// import { CommonModule } from '@angular/common';
// import { Component, Input, SimpleChanges } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { MatTableModule } from '@angular/material/table';

// interface Cell {
//   value: string | null;
//   hyperlink?: string | null;
// }

// @Component({
//   selector: 'app-biblio',
//   standalone: true,
//   imports: [CommonModule, FormsModule, MatTableModule],
//   templateUrl: './biblio.component.html',
//   styleUrls: ['./biblio.component.scss'],
// })
// export class BiblioComponent {
//   expandedAbstractRows: Set<number> = new Set();
//   expandedFamilyRows: Set<number> = new Set();
//   @Input() sheet?: any;

//   ngOnChanges(changes: SimpleChanges): void {}

//   get safeSheet(): any {
//     if (!this.sheet) {
//       throw new Error('Sheet is undefined but accessed in template');
//     }
//     return this.sheet;
//   }

//   getHeaders(): string[] {
//     const headerRow = this.sheet?.rows?.[4] ?? [];
//     return headerRow.map((cell: any) => cell?.value?.toString() ?? '');
//   }

//   getDataRows(): Cell[][] {
//     return this.sheet?.rows?.slice(5) ?? [];
//   }

//   /** ------------ FAMILY -------------- */
//   getFamilyPreview(value: string | null): string[] {
//     if (!value) return [];
//     const members = value
//       .split('|')
//       .map((m) => m.trim())
//       .filter((m) => m);
//     return members.slice(0, 5);
//   }

//   getFamilyAll(value: string | null): string[] {
//     if (!value) return [];
//     return value
//       .split('|')
//       .map((m) => m.trim())
//       .filter((m) => m);
//   }

//   isFamilyLong(value: string | null): boolean {
//     if (!value) return false;
//     return value.split('|').filter((m) => m.trim()).length > 5;
//   }

//   toggleFamily(rowIndex: number): void {
//     if (this.expandedFamilyRows.has(rowIndex)) {
//       this.expandedFamilyRows.delete(rowIndex);
//     } else {
//       this.expandedFamilyRows.add(rowIndex);
//     }
//   }

//   /** ------------ ABSTRACT -------------- */
//   getAbstractPreviewLines(
//     value: string | null,
//     wordsPerLine: number = 12
//   ): string[] {
//     if (!value) return [];
//     if (typeof value !== 'string') value = String(value);

//     const words = value.split(/\s+/);
//     let lines: string[] = [];

//     // Sirf 2 line banani hai
//     for (
//       let i = 0;
//       i < Math.min(words.length, wordsPerLine * 2);
//       i += wordsPerLine
//     ) {
//       lines.push(words.slice(i, i + wordsPerLine).join(' '));
//     }

//     return lines;
//   }

//   getAbstractAllLines(
//     value: string | null,
//     wordsPerLine: number = 12
//   ): string[] {
//     if (!value) return [];
//     if (typeof value !== 'string') value = String(value);

//     const words = value.split(/\s+/);
//     let lines: string[] = [];

//     for (let i = 0; i < words.length; i += wordsPerLine) {
//       lines.push(words.slice(i, i + wordsPerLine).join(' '));
//     }

//     return lines;
//   }

//   isAbstractLong(value: string | null, wordsPerLine: number = 12): boolean {
//     if (!value) return false;
//     const words = value.split(/\s+/);
//     return words.length > wordsPerLine * 2;
//   }

//   toggleAbstract(rowIndex: number): void {
//     if (this.expandedAbstractRows.has(rowIndex)) {
//       this.expandedAbstractRows.delete(rowIndex);
//     } else {
//       this.expandedAbstractRows.add(rowIndex);
//     }
//   }
// }


import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';

interface Cell {
  value: string | null;
  hyperlink?: string | null;
}

@Component({
  selector: 'app-biblio',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule],
  templateUrl: './biblio.component.html',
  styleUrls: ['./biblio.component.scss'],
})
export class BiblioComponent {
  expandedAbstractRows: Set<number> = new Set();
  expandedFamilyRows: Set<number> = new Set();
  @Input() sheet?: any;

  ngOnChanges(changes: SimpleChanges): void {}

  get safeSheet(): any {
    if (!this.sheet) {
      throw new Error('Sheet is undefined but accessed in template');
    }
    return this.sheet;
  }

  getHeaders(): string[] {
    const headerRow = this.sheet?.rows?.[4] ?? [];
    return headerRow.map((cell: any) => cell?.value?.toString() ?? '');
  }

  getDataRows(): Cell[][] {
    return this.sheet?.rows?.slice(5) ?? [];
  }

  /** ------------ FAMILY -------------- */
  getFamilyPreview(value: string | null): string[] {
    if (!value) return [];
    const members = value
      .split('|')
      .map((m) => m.trim())
      .filter((m) => m);
    return members.slice(0, 5); // show only 5
  }

  getFamilyAll(value: string | null): string[] {
    if (!value) return [];
    return value
      .split('|')
      .map((m) => m.trim())
      .filter((m) => m);
  }

  isFamilyLong(value: string | null): boolean {
    if (!value) return false;
    return value.split('|').filter((m) => m.trim()).length > 5;
  }

  toggleFamily(rowIndex: number): void {
    if (this.expandedFamilyRows.has(rowIndex)) {
      this.expandedFamilyRows.delete(rowIndex);
    } else {
      this.expandedFamilyRows.add(rowIndex);
    }
  }

  /** ------------ ABSTRACT -------------- */
  getAbstractPreviewLines(
    value: string | null,
    wordsPerLine: number = 12
  ): string[] {
    if (!value) return [];
    if (typeof value !== 'string') value = String(value);

    const words = value.split(/\s+/);
    let lines: string[] = [];

    // show only 2 lines
    for (
      let i = 0;
      i < Math.min(words.length, wordsPerLine * 2);
      i += wordsPerLine
    ) {
      lines.push(words.slice(i, i + wordsPerLine).join(' '));
    }

    return lines;
  }

  getAbstractAllLines(
    value: string | null,
    wordsPerLine: number = 12
  ): string[] {
    if (!value) return [];
    if (typeof value !== 'string') value = String(value);

    const words = value.split(/\s+/);
    let lines: string[] = [];

    for (let i = 0; i < words.length; i += wordsPerLine) {
      lines.push(words.slice(i, i + wordsPerLine).join(' '));
    }

    return lines;
  }

  isAbstractLong(value: string | null, wordsPerLine: number = 12): boolean {
    if (!value) return false;
    const words = value.split(/\s+/);
    return words.length > wordsPerLine * 2;
  }

  toggleAbstract(rowIndex: number): void {
    if (this.expandedAbstractRows.has(rowIndex)) {
      this.expandedAbstractRows.delete(rowIndex);
    } else {
      this.expandedAbstractRows.add(rowIndex);
    }
  }
}
