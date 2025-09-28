import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../../../../environments/environment';

interface SheetImage {
  base64: string;
  row: number;
  column: number;
}

@Component({
  selector: 'app-mapping',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, MatTableModule, CdkTableModule],
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MappingComponent implements OnChanges, OnInit {
  backendUrl = environment.apiUrl; // ✅ backend URL from environment

  constructor(private route: ActivatedRoute, private cdr: ChangeDetectorRef) {}
  // imagesData: { url: string }[] = [];
  @Input() columns: any[] = [];
  @Input() rows: any[][] = [];
  @Input() images: any[] = [];
  @Input() onClaimSelected?: (claimId: string) => void;
  @Input() patentNumber: string = '';
  @Input() claimWithElement: string = '';
  @Input() selectedPatentColumn: string = '';
  @Input() selectedResult: string = '';
  @Input() selectedElement: string = '';

  imagesData: SheetImage[] = [];

  columnKeys: string[] = [];
  filteredRows: any[][] = [];
  filteredColumnIndices: number[] = [];
  filteredColumns: string[] = [];
  resultToPatentMap: { [key: string]: string } = {};
  expandedCells: { [key: string]: boolean } = {};

  readonly UNWANTED_ROW_KEYWORDS = [
    'Back to TOC',
    'Objective & Methodology',
    'Overview',
    'Primary Results - Matrix',
    'Secondary Results',
    'Primary Results - Bibliographic Details',
    'PRIMARY REFERENCES - MAPPING',
    'Primary References',
  ];

  ngOnInit(): void {
    const { result, patent, element } = this.route.snapshot.queryParams;

    if (result && patent && element) {
      this.selectedResult = result;
      this.selectedPatentColumn = patent;
      this.selectedElement = element;
      this.claimWithElement = `${result}|${element}`;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows'] && this.rows?.length > 0) {
      this.columns = this.rows[4]; // header row
      this.filteredRows = this.rows.slice(5); // data rows
      this.columnKeys = this.columns.map((_, index) => index.toString());
      this.computeResultToPatentMap();
      this.filterUnwantedRows();
    }

    if (changes['images'] && this.images?.length > 0) {
      this.imagesData = this.images;
      console.log('✅ Images assigned to imagesData:', this.imagesData);
    }

    if (
      (changes['selectedResult'] || changes['selectedElement']) &&
      this.selectedResult &&
      this.selectedElement
    ) {
      this.applyFilter();
      this.cdr.detectChanges();
    }
  }

  private applyFilter(): void {
    if (!this.rows?.length) return;
    if (!this.selectedResult || this.selectedResult.toLowerCase() === 'all') {
      this.displayAllData();
      return;
    }
    this.applySelectedFilter(
      this.selectedPatentColumn,
      this.selectedResult,
      this.selectedElement
    );
  }

  displayAllData(): void {
    this.filteredRows = this.rows.slice(5);
    this.filteredColumnIndices = this.columns.map((_, index) => index);
  }

  applySelectedFilter(
    patentNumber: string,
    resultName: string,
    elementNo: string
  ): void {
    const normalizedPatentNumber = this.normalizePatent(patentNumber);
    const colIndex = this.columns.findIndex(
      (col) =>
        this.normalizePatent(col?.value?.toString() || '') ===
        normalizedPatentNumber
    );

    if (colIndex !== -1) {
      this.filteredColumnIndices = [0, 1, 2, colIndex];
      const dataRows = this.rows.slice(5);

      const clickedRowIndex = dataRows.findIndex(
        (row) => row[1]?.value?.toString().trim() === elementNo
      );

      if (clickedRowIndex !== -1) {
        const clickedRow = dataRows[clickedRowIndex];
        const remainingRows = dataRows.filter(
          (_, idx) => idx !== clickedRowIndex
        );
        this.filteredRows = [clickedRow, ...remainingRows];
      } else {
        this.filteredRows = dataRows;
      }
    }
  }

  normalizePatent(value: string): string {
    return value
      .replace(/^Patent No\.\s*/, '')
      .split('\n')[0]
      .replace(/[\s,]/g, '')
      .replace(/US/, 'US ')
      .trim();
  }

  computeResultToPatentMap(): void {
    this.resultToPatentMap = {};
    this.columns.slice(3).forEach((col, i) => {
      const rawValue = col?.value?.toString() || '';
      const cleanValue = this.normalizePatent(rawValue);
      this.resultToPatentMap[`Result ${i + 1}`] = cleanValue;
    });
  }

  getImageForCell(rowIndex: number, colIndex: number): string {
    console.log('🔍 Checking cell => row:', rowIndex, 'col:', colIndex);
    console.log('🖼 Available Images:', this.imagesData);
    const img = this.imagesData.find(
      (i) => i.row === rowIndex + 5 && i.column === colIndex
    );
    console.log('➡️ Match found:', img);
    return img ? 'data:image/png;base64,' + img.base64 : '';
  }

  onImageError(event: Event) {
    const element = event.target as HTMLImageElement;
    element.style.display = 'none';
  }

  filterUnwantedRows(): void {
    this.filteredRows = this.rows.filter((row) => {
      const combined = row
        .map((cell) => cell?.value?.toString().toLowerCase().trim())
        .join(' ');
      return !this.UNWANTED_ROW_KEYWORDS.some((keyword) =>
        combined.includes(keyword.toLowerCase())
      );
    });
  }

  isResultActive(result: string): boolean {
    if (!this.resultToPatentMap) return false;
    if (!this.selectedResult) return false;

    if (this.selectedResult.toLowerCase() === 'all') return false;
    const mappedPatent = this.resultToPatentMap[result];
    // find by normalizePatent to avoid small differences
    const matchIndex = this.columns.findIndex(
      (col) =>
        this.normalizePatent(col?.value?.toString() || '') ===
        this.normalizePatent(mappedPatent || '')
    );
    return this.filteredColumnIndices.includes(matchIndex);
  }

  isResultAllActive(): boolean {
    return this.selectedResult === 'ALL';
  }

  onResultClick(resultName: string): void {
    this.selectedResult = resultName;

    if (resultName === 'ALL') {
      this.displayAllData();
      return;
    }
    const patentNo = this.resultToPatentMap[resultName];
    const elementNo = this.claimWithElement.split('|')[1] || '';
    this.applySelectedFilter(patentNo, resultName, elementNo);
  }

  get filteredColumnKeys(): string[] {
    return this.filteredColumnIndices.map((i) => i.toString());
  }

  onResultAllClick(): void {
    this.displayAllData();
  }

  highlightRow(row: any): boolean {
    if (!this.claimWithElement) return false;

    const [result, element] = this.claimWithElement
      .split('|')
      .map((s) => s.trim().toLowerCase());
    const rowResult =
      typeof row['0']?.value === 'string' ? row['0'].value.toLowerCase() : '';
    const rowElement =
      typeof row['1']?.value === 'string' ? row['1'].value.toLowerCase() : '';

    return rowResult === result && rowElement === element;
  }
  get dynamicColumnIndices(): number[] {
    return this.filteredColumnIndices.filter((i) => i > 2);
  }
  readonly ROW_OFFSET = 8; // because filteredRows = rows.slice(5) → often 6 or 7, set as you need
  readonly COL_OFFSET = 2;
  getImageForExactCol(rowIndex: number, imageColIndex: number): any | null {
    const excelRow = rowIndex + this.ROW_OFFSET;
    const excelCol = this.imageColumnExcelCols[imageColIndex]; // e.g. [6,8,10][0]=6, [1]=8, etc.
    return (
      this.images.find(
        (img) => img.row === excelRow && img.column === excelCol
      ) || null
    );
  }
  get imageColumnExcelCols(): number[] {
    // Example: [6, 8, ...]  // as per your backend images
    // You can also make this dynamic if you know the mapping
    // For now, let's map: first image column = 6, second = 8, etc.
    return [6, 8, 10]; // <-- yahan apne backend ke hisaab se col numbers daalo
  }
  get displayedColumns(): string[] {
    const staticCols = this.filteredColumnIndices
      .filter((i) => i <= 2)
      .map((i) => i.toString());
    const dynamic = this.filteredColumnIndices.filter((i) => i > 2);
    const pairs: string[] = [];
    for (const i of dynamic) {
      pairs.push(i.toString()); // text
      pairs.push('img_' + i.toString()); // image
    }
    return [...staticCols, ...pairs];
  }

  // expandedCells: { [key: string]: boolean } = {};

  isCellExpanded(rowIndex: number, colIndex: number): boolean {
    return !!this.expandedCells[`${rowIndex}_${colIndex}`];
  }

  expandCell(event: Event, rowIndex: number, colIndex: number) {
    event.preventDefault();
    this.expandedCells[`${rowIndex}_${colIndex}`] = true;
    this.cdr.detectChanges();
  }

  collapseCell(event: Event, rowIndex: number, colIndex: number) {
    event.preventDefault();
    this.expandedCells[`${rowIndex}_${colIndex}`] = false;
    this.cdr.detectChanges();
  }

  getShortText(value: any, wordsPerLine: number = 12): string {
    if (!value) return '';
    if (typeof value !== 'string') value = String(value);

    const words = value.split(/\s+/);
    let lines: string[] = [];

    // Sirf 5 lines banani hain
    for (
      let i = 0;
      i < Math.min(words.length, wordsPerLine * 5);
      i += wordsPerLine
    ) {
      lines.push(words.slice(i, i + wordsPerLine).join(' '));
    }

    return lines.join('\n');
  }

  isTextLong(value: any, wordsPerLine: number = 12): boolean {
    if (!value) return false;
    if (typeof value !== 'string') value = String(value);

    const words = value.split(/\s+/);
    return words.length > wordsPerLine * 5; // agar 5 se zyada line hai to "more"
  }
}
