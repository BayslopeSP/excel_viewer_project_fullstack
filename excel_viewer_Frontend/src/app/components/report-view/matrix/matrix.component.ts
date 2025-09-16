import {
  Component,
  Input,
  Output,
  EventEmitter,
  NgModule,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { Sheet } from '../../../models/excel-sheet.model';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  Router,
  RouterLink,
  RouterModule,
  RouterOutlet,
  Routes,
} from '@angular/router';

@Component({
  selector: 'app-matrix',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatCheckboxModule, RouterModule],
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss'],
})
export class MatrixComponent implements OnChanges {
  // Inject the Router service for navigation
  constructor(private router: Router) {}

  // Inputs and Outputs for communication with parent components
  @Input() sheet?: Sheet;
  @Output() checkboxClicked = new EventEmitter<{
    patentNumber: string;
    resultName: string;
    elementNo: string;
    claimId: string;
  }>();

  dynamicHeaders: string[] = [];

  // Lifecycle hook that runs when input properties change
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sheet'] && this.sheet) {
      this.getHeaders();
    }
  }

  /**
   * Extracts the dynamic headers from the correct row of the Excel sheet.
   * This is based on the structure of your uploaded data.
   */
  getHeaders(): string[] {
    if (!this.sheet?.rows || this.sheet.rows.length === 0) return [];
    // The headers start at the 6th row (index 5) in your data structure.
    const firstRow = this.sheet.rows[5];
    const headers = firstRow.map(
      (cell: any) => cell?.value?.toString().trim() ?? ''
    );
    // The dynamic headers are from the 4th column onwards.
    this.dynamicHeaders = headers.slice(3);
    return headers;
  }

  /**
   * Processes the raw sheet data into a structured format for the matrix table.
   * Filters out the legend rows and correctly maps symbols.
   */
  getMatrixRows(): any[] {
    if (!this.sheet?.rows || this.sheet.rows.length < 8) return [];

    const rows = this.sheet.rows.slice(6); // Skip header and legend rows
    const result = [];

    for (const row of rows) {
      const claimNo = row[0]?.value?.toString().trim() ?? '';
      const elementNo = row[1]?.value?.toString().trim() ?? '';
      const claimText = row[2]?.value?.toString().trim() ?? '';

      // Skip rows that are part of the legend, not the matrix data
      if (
        claimNo.toLowerCase().includes('indicates') ||
        claimText.toLowerCase().includes('legend')
      ) {
        continue;
      }

      const mappings = row.slice(3).map((cell) => {
        const original = cell?.value?.toString().trim().toUpperCase() ?? '';
        let display = '';
        // Correctly map the Excel symbols to your legend's symbols
        if (original === 'P') {
          display = '✔️';
        } else if (original === '*P') {
          display = '🔷';
        } else if (original === 'Þ' || original === 'þ') {
          // Handle both cases for robustness
          display = '🔍';
        }

        return { original, display, hyperlink: cell?.hyperlink ?? '' };
      });

      result.push({ claimNo, elementNo, claimText, mappings });
    }

    return result;
  }

  // A getter to prepare the button labels based on the dynamic headers
  get resultButtons(): string[] {
    return this.dynamicHeaders.map((header) => {
      // Clean up the header text for a better button label
      return header.replace(/["\s]/g, '').replace('B1', '');
    });
  }

  /**
   * Handles the click event on a mapping cell.
   * Correctly uses the claimId passed to the function for navigation.
   */
  onMappingCellClick(
    mapIndex: number,
    claimId: string,
    elementNo: string,
    // patentNumber: string,
    // resultName: string
  ): void {
    console.log('Clicked:', { mapIndex, claimId, elementNo });

    const patentNumber = this.dynamicHeaders[mapIndex];
    const resultName = `Result ${mapIndex + 1}`;

    // Emit data to the parent component
    this.checkboxClicked.emit({
      patentNumber: patentNumber,
      resultName: resultName,
      elementNo: elementNo,
      claimId: claimId || elementNo,
    });

    // Navigate to the mapping page with state data
    // this.router.navigate(['/mapping'], {
    //   queryParams: {
    //     result: resultName, // 👈 FIXED
    //     patent: patentNumber, // 👈 FIXED name
    //     element: elementNo, // 👈 FIXED name
    //     claim: claimId || elementNo, // optional
    //   },
    // });
  }
  onHeaderCheckboxClick(
    mapIndex: number,
    claimId: string,
    elementNo: string
  ): void {
    console.log('Header Checkbox Clicked:', { mapIndex, claimId, elementNo });

    // You can reuse the same logic as onMappingCellClick or keep it separate
    this.onMappingCellClick(mapIndex, claimId, elementNo);
  }
}
