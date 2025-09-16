import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser'; // 👈 Yeh import add karein


@Component({
  selector: 'app-mapping',
  standalone: true,
  imports: [CommonModule, MatCheckboxModule, MatTableModule, CdkTableModule],
  templateUrl: './mapping.component.html',
  styleUrls: ['./mapping.component.scss'],
})
export class MappingComponent implements OnChanges, OnInit {
  constructor(
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}
  @Input() columns: any[] = []; // First row: headers
  @Input() rows: any[][] = []; // Full data including headers
  @Input() images: any[] = []; // Optional: for embedded images
  @Input() onClaimSelected?: (claimId: string) => void;
  @Input() patentNumber: string = ''; // The selected patent number
  @Input() claimWithElement: string = '';
  @Input() selectedPatentColumn: string = '';
  @Input() selectedResult: string = '';
  @Input() selectedElement: string = ''; // Optional if element is passed separately

  columnKeys: string[] = []; // All column indices
  filteredRows: any[][] = []; // Data rows (excluding header)
  filteredColumnIndices: number[] = []; // First 3 + selected Result X
  filteredColumns: string[] = [];
  resultToPatentMap: { [key: string]: string } = {}; // Map to store Result X -> Actual patent

  private imageMap: { [key: string]: string } = {
    'FIG. 2': 'image_0ca39b.png',
    'FIG. 4f': 'image_fbb701.png',
    'FIG. 4g': 'image_fb46a3.png', // Yahan par aapki baaki images ke references aur file names daalein
  };

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
    console.log('Route Query Params:', this.route.snapshot.queryParams); // Check the initial query params
    const sheetId = this.route.snapshot.queryParams['sheetId'];

    const result = this.route.snapshot.queryParams['result'];
    const patent = this.route.snapshot.queryParams['patent'];
    const element = this.route.snapshot.queryParams['element'];

    if (result && patent && element) {
      console.log('Query Params:', { result, patent, element });
      this.selectedResult = result;
      this.selectedPatentColumn = patent;
      // this.claimWithElement = `${this.selectedElement}`;
      this.selectedElement = element;
      this.claimWithElement = `${result}|${element}`;

      // this.applySelectedFilter(patent, result, element);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Console logs se pata chala ki 'rows' aur 'selectedResult' alag-alag aate hain.
    // Isliye, dono changes ko handle karna zaroori hai.
    if (changes['rows'] && this.rows && this.rows.length > 0) {
      this.columns = this.rows[4];
      this.filteredRows = this.rows.slice(5);
      this.columnKeys = this.columns.map((_, index) => index.toString());
      this.computeResultToPatentMap();
    }

    // ✅ Yeh condition sabse zaroori hai! Jab bhi selectedResult ya selectedElement
    // ki value badle, filter ko dobara chalao.
    // ✅ Yeh logic ab selectedResult ya selectedElement change hone par chalega.
    if (
      (changes['selectedResult'] || changes['selectedElement']) &&
      this.selectedResult &&
      this.selectedElement
    ) {
      this.applyFilter();
      this.cdr.detectChanges(); // 👈 Force UI update
    }
  }
  private applyFilter(): void {
    if (!this.rows || this.rows.length === 0) {
      console.warn('Cannot apply filter: Rows data is not available.');
      return;
    }

    if (!this.selectedResult || this.selectedResult.toLowerCase() === 'all') {
      this.displayAllData();
      return;
    }

    // Yahan applySelectedFilter ko call karein
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
    console.log('⚡ applySelectedFilter called with:', {
      patentNumber,
      resultName,
      elementNo,
    });
    console.log(
      '🔹 Available columns:',
      this.columns.map((c) => c?.value)
    );
    console.log('🔹 Available rows:', this.rows);

    const normalizedPatentNumber = this.normalizePatent(patentNumber); // 👈 Input ko normalize karein
    const colIndex = this.columns.findIndex(
      (col) =>
        this.normalizePatent(col?.value?.toString() || '') ===
        normalizedPatentNumber
    );
    console.log('🔹 Matched Patent Column Index:', colIndex);

    if (colIndex !== -1) {
      this.filteredColumnIndices = [0, 1, 2, colIndex];
      const dataRows = this.rows.slice(5);

      const clickedRowIndex = dataRows.findIndex(
        (row) => row[1]?.value?.toString().trim() === elementNo
      );
      console.log('🔹 Matched Row Index:', clickedRowIndex);

      if (clickedRowIndex !== -1) {
        const clickedRow = dataRows[clickedRowIndex];
        console.log('✅ Clicked Row Found:', clickedRow);
        const remainingRows = dataRows.filter(
          (_, idx) => idx !== clickedRowIndex
        );
        this.filteredRows = [clickedRow, ...remainingRows];
      } else {
        console.warn('⚠️ No matching row found for element:', elementNo);
        this.filteredRows = dataRows;
      }
    } else {
      console.warn('⚠️ No matching patent column found!');
    }
  }

  normalizePatent(value: string): string {
    return value
      .replace(/^Patent No\.\s*/, '') // remove "Patent No."
      .split('\n')[0] // keep only first line (patent number)
      .replace(/[\s,]/g, '')
      .replace(/US/, 'US ')
      .trim();
  }

  // 1. Create map of Result X -> Actual patent
  computeResultToPatentMap(): void {
    this.resultToPatentMap = {};
    this.columns.slice(3).forEach((col, i) => {
      const rawValue = col?.value?.toString() || '';
      const cleanValue = this.normalizePatent(rawValue);
      this.resultToPatentMap[`Result ${i + 1}`] = cleanValue;
    });
    console.log('Result to Patent Map (normalized):', this.resultToPatentMap);
  }

  computeFilteredColumnIndices(): void {
    this.filteredColumnIndices = [0, 1, 2];

    if (this.selectedResult) {
      const mappedPatent = this.resultToPatentMap[this.selectedResult];
      const matchIndex = this.columns.findIndex((col) => {
        const cleanValue = this.normalizePatent(col?.value?.toString() || '');
        return cleanValue === mappedPatent;
      });

      if (matchIndex !== -1 && matchIndex > 2) {
        this.filteredColumnIndices.push(matchIndex);
      }
    }

    console.log('Updated Filtered Column Indices:', this.filteredColumnIndices);
  }

  updateFilteredColumns(): void {
    // Example filtering logic based on patent number and selected claim/element
    if (this.selectedResult && this.patentNumber) {
      console.log(
        'Updating filtered columns with result:',
        this.selectedResult,
        'and patent:',
        this.patentNumber
      );
      this.filteredColumns = this.getFilteredColumnsByPatentAndClaim();
      console.log('Filtered Columns:', this.filteredColumns); // Log filtered columns
    }
  }

  getFilteredColumnsByPatentAndClaim(): string[] {
    // Use this.selectedResult and this.patentNumber to get the appropriate columns
    // Assuming col.value is where the actual column value is stored
    return this.columns
      .filter((col) => {
        // Ensure that col.value is a string before calling includes
        return (
          col.value &&
          typeof col.value === 'string' &&
          col.value.includes(this.selectedResult)
        );
      })
      .map((col) => col.value); // Map to return the actual value (not the column object)
  }

  // Get visible row values (for display)
  getFilteredRow(row: any[]): any[] {
    const selected = this.filteredColumnIndices.map((index) => row[index]);
    console.log('Selected row for display:', selected);
    return selected;
  }

  // Hyperlink click handler from checkbox
  onCheckboxClick(cell: any): void {
    if (cell?.hyperlink && cell?.hyperlink.startsWith('#')) {
      const claimId = cell.hyperlink.slice(1);
      console.log('Clicked checkbox for claim:', claimId);

      if (this.onClaimSelected) {
        this.onClaimSelected(claimId);
      }
    }
  }

  // Image rendering (if used)
  getImageForCell(rowIndex: number, colIndex: number): string | null {
    const img = this.images.find(
      (img) => img.row === rowIndex && img.column === colIndex
    );
    // return img ? `http://localhost:8000${img.image}` : null;
    return img
      ? `https://excel-viewer-project-fullstack.onrender.com${img.image}`
      : null;
  }

  // Filter out unwanted content rows (if needed)
  filterUnwantedRows(): void {
    this.filteredRows = this.rows.filter((row) => {
      const combined = row
        .map((cell) => cell?.value?.toString().toLowerCase().trim())
        .join(' ');
      return !this.UNWANTED_ROW_KEYWORDS.some((keyword) =>
        combined.includes(keyword.toLowerCase())
      );
    });
    console.log('Filtered Rows (After Removing Unwanted):', this.filteredRows);
  }

  // Optional backup table filtering
  getVisibleRows(): any[][] {
    return this.rows.filter((row) =>
      row.some((cell) => cell?.value && cell.value.toString().trim() !== '')
    );
  }
  isImage(cellContent: any): boolean {
    // return cellContent && this.imageMap[cellContent];
    return (
      cellContent &&
      typeof cellContent === 'string' &&
      !!this.imageMap[cellContent]
    );
  } // ✅ 3. Yeh naya function 'getImageUrl' add karein.

  getImageUrl(cellContent: any): SafeHtml {
    const imageName = this.imageMap[cellContent];
    if (imageName) {
      const imagePath = `assets/${imageName}`; // Image ka path yahan se banega // `bypassSecurityTrustHtml` ka istemal Angular ko batata hai ki yeh HTML safe hai
      return this.sanitizer.bypassSecurityTrustHtml(
        `<img src="${imagePath}" alt="${cellContent}" class="mapping-image">`
      );
    }
    return this.sanitizer.bypassSecurityTrustHtml('');
  }

  isResultActive(result: string): boolean {
    if (this.selectedResult === 'ALL') return false;
    const mappedPatent = this.resultToPatentMap[result];
    const matchIndex = this.columns.findIndex(
      (col) => col?.value?.toString().trim() === mappedPatent
    );
    return this.filteredColumnIndices.includes(matchIndex);
  }
  isResultAllActive(): boolean {
    return this.selectedResult === 'ALL';
  }

  // Click event for Result X button
  onResultClick(resultName: string): void {
    console.log('🔎 Mapping Result clicked for:', resultName);

    this.selectedResult = resultName;

    const elementNo = this.claimWithElement.split('|')[1]; // extract existing element number
    this.claimWithElement = `${this.selectedResult}|${this.selectedElement}`;

    if (resultName === 'ALL') {
      this.filteredRows = this.rows.slice(5);
      this.filteredColumnIndices = this.columns.map((_, index) => index);
      this.filteredColumns = this.filteredColumnIndices.map(
        (index) => this.columns[index]
      );
      return;
    }

    this.computeFilteredColumnIndices();
    this.updateFilteredColumns();
    this.applySelectedFilter(this.patentNumber, resultName, elementNo);
  }

  get filteredColumnKeys(): string[] {
    return this.filteredColumnIndices.map((i) => i.toString());
  }

  onResultAllClick(): void {
    console.log('🟢 Result All clicked');
    this.selectedResult = 'ALL';
    // Show all data rows
    this.filteredRows = this.rows.slice(5); // Skip header

    // Show all columns
    this.filteredColumnIndices = this.columns.map((_, index) => index); // Include all columns

    // Update selected columns
    this.filteredColumns = this.filteredColumnIndices.map(
      (index) => this.columns[index]
    );
    console.log('All rows and columns displayed.');
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
}
