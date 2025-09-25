import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ViewChild, ElementRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoverPageComponent } from './cover-page/cover-page.component';
import { GenericSheetComponent } from './generic-sheet/generic-sheet.component';
import { Column, Sheet } from '../../models/excel-sheet.model';
import { ObjectiveComponent } from './objective/objective.component';
import { OverviewComponent } from './overview/overview.component';
import { MatrixComponent } from './matrix/matrix.component';
import { MappingComponent } from './mapping/mapping.component';
import { BiblioComponent } from './biblio/biblio.component';
import { SecondaryComponent } from './secondary/secondary.component';
import { SearchstringComponent } from './searchstring/searchstring.component';
import { DisclaimerComponent } from './disclaimer/disclaimer.component';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-report-view',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatTableModule,
    CommonModule,
    MatTabsModule,
    MatCardModule,
    RouterModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    CoverPageComponent,
    ObjectiveComponent,
    OverviewComponent,
    GenericSheetComponent,
    MatrixComponent,
    MappingComponent,
    BiblioComponent,
    SecondaryComponent,
    SearchstringComponent,
    DisclaimerComponent,
    MatSidenavModule,
  ],
  templateUrl: './report-view.component.html',
  styleUrls: ['./report-view.component.scss'],
})
export class ReportViewComponent implements OnInit {
  @ViewChild('matrixTable', { static: false, read: ElementRef })
  
  matrixTableRef!: ElementRef;

  sheetId!: number;
  sheetsData: Sheet[] = [];
  fileId!: number
  matrixSheet: any;
  mappingSheet: any;
  selectedTabIndex: number = 0;
  mappingTabIndex: number = -1;

  filteredMappingRows: any[] = [];
  showMappingComponent = true;
  selectedResult: string = '';
  selectedPatentColumn: string = '';
  selectedElement: string = '';
  selectedPatent: string = '';
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    public elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.fileId = +params['fileId'];
      if (this.fileId) {
        this.loadSheetData();
      } else {
        console.error('fileId  is missing');
      }
    });
  }

  loadSheetData(): void {
    this.apiService.getExcelFileById(this.fileId).subscribe({
      next: (data) => {
        this.sheetsData = data.sheets || [];
        console.log('Response mila:', data);
        const allSheets = data.sheets.map((sheet: any) => {
          sheet = this.cleanSheetData(sheet);
          sheet.columnDefs = sheet.columns.map(
            (_col: Column, i: number) => 'col' + i
          );
          return sheet;
        });

        this.sheetsData = allSheets.filter(
          (sheet: any) => sheet.name.toLowerCase() !== 'table of contents'
        );

        const desiredOrder = [
          'COVER PAGE',

          'PRIMARY RESULTS - MATRIX',
          'PRIMARY RESULTS - MAPPING',
          'PRIMARY RESULTS - BIBLIO',
          'SECONDARY RESULTS',
          'SEARCH STRINGS',
          'OBJECTIVE & METHODOLOGY',
          'OVERVIEW',
          'DISCLAIMER',
        ];

        this.sheetsData.sort((a, b) => {
          const idxA = desiredOrder.indexOf(a.name.toUpperCase());
          const idxB = desiredOrder.indexOf(b.name.toUpperCase());
          return idxA - idxB;
        });

        this.matrixSheet = allSheets.find((s: Sheet) =>
          s.name.toLowerCase().includes('matrix')
        );

        this.mappingSheet = allSheets.find((s: Sheet) =>
          s.name.toLowerCase().includes('mapping')
        );

        this.mappingTabIndex = this.sheetsData.findIndex((sheet) =>
          sheet.name.toLowerCase().includes('mapping')
        );
      },
      error: (err) => {
        console.error('Failed to fetch sheet data:', err);
      },
    });
  }

  cleanSheetData(sheet: Sheet): Sheet {
    const sheetName = sheet.name.toLowerCase();

    if (
      sheetName === 'primary matrix' ||
      sheetName.startsWith('primary matrix')
    ) {
      return sheet;
    }

    sheet.rows = sheet.rows.filter((row: Column[]) =>
      row.some((cell) => cell?.value && cell.value.toString().trim() !== '')
    );

    const columnsToKeep = sheet.columns.map((_, colIndex) =>
      sheet.rows.some((row) => {
        const cell = row[colIndex];
        return cell?.value && cell.value.toString().trim() !== '';
      })
    );

    sheet.columns = sheet.columns.filter((_, index) => columnsToKeep[index]);
    sheet.rows = sheet.rows.map((row) =>
      row.filter((_, index) => columnsToKeep[index])
    );

    return sheet;
  }

  // onClaimSelected(event: { patentNumber: string; claimWithElement: string ; }) {
  //   const { patentNumber, claimWithElement } = event;
  //   if (!this.mappingSheet?.rows?.length) return;
  //   if (!claimWithElement.includes('|')) {
  //     console.warn('Invalid claimWithElement format:', claimWithElement);

  //     return;
  //   }

  //   this.selectedPatentColumn = patentNumber;
  //   const [resultName, elementNo] = claimWithElement.split('|').map(x => x.trim().toLowerCase());
  //   console.log('Result Name:', resultName);
  //   console.log('Element No:', elementNo);
  //   const matchedRows = this.mappingSheet.rows.filter((row: Column[]) => {
  //     const resultCell = row[0];
  //     const elementCell = row[1];
  //     return (
  //       resultCell?.value?.toString().trim().toLowerCase() === resultName &&
  //       elementCell?.value?.toString().trim().toLowerCase() === elementNo
  //     );
  //   });
  //   if (matchedRows.length > 0) {
  //     this.filteredMappingRows = [...matchedRows];
  //     const mappingTabIndex = this.sheetsData.findIndex(
  //       sheet => sheet.name.toLowerCase().includes('mapping')
  //     );
  //     if (mappingTabIndex !== -1) {
  //       this.selectedTabIndex = mappingTabIndex;
  //     } else {
  //       console.warn('Mapping tab not found.');
  //     }
  //   } else {
  //     console.warn(`No rows found for result "${resultName}" and element "${elementNo}" in mapping sheet.`);
  //     this.filteredMappingRows = [];
  //   }
  // }

  onTabChange(event: MatTabChangeEvent): void {
    const selectedTabLabel = event.tab.textLabel;
    if (
      selectedTabLabel.toLowerCase().includes('matrix') ||
      selectedTabLabel.toLowerCase().includes('mapping')
    ) {
      setTimeout(() => {
        this.scrollToBottom();
      }, 200);
      console.log('📌 Mapping tab opened with:', {
        patent: this.selectedPatent,
        result: this.selectedResult,
        element: this.selectedElement,
      });

      // Optional: Only reload Mapping if inputs changed
      this.showMappingComponent = false;
      this.cdr.detectChanges();
      this.showMappingComponent = true;
      // setTimeout(() => (this.showMappingComponent = true), 0);
    }
  }
  scrollToMatrixTable() {
    if (this.matrixTableRef && this.matrixTableRef.nativeElement) {
      this.matrixTableRef.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  onSelectionChanged(data: {
    patentNumber: string;
    resultName: string;
    elementNo: string;
    claimId: string;
  }) {
    // 🔹 Update inputs first
    this.selectedPatent = data.patentNumber;
    this.selectedResult = data.resultName;
    this.selectedElement = data.elementNo;
    this.selectedPatentColumn = data.patentNumber;

    console.log('Parent selectedPatent:', this.selectedPatent);
    console.log('Parent selectedResult:', this.selectedResult);
    console.log('Parent selectedElement:', this.selectedElement);

    // 🔹 Switch tab AFTER inputs are bound
    if (this.mappingTabIndex !== -1) {
      this.selectedTabIndex = 0;

      setTimeout(() => {
        this.selectedTabIndex = this.mappingTabIndex;
        console.log('🔀 Switched to Mapping tab:', this.mappingTabIndex);
      }, 10);
    }
  }

  scrollToBottom() {
    // window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
}
