import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SafePipe } from '../../safe.pipe';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { PdfIntroComponent } from '../../pdfComponent/pdf-intro/pdf-intro.component';
import { PdfFeatureMatrixComponent } from '../../pdfComponent/pdf-feature-matrix/pdf-feature-matrix.component';
// import { DisclaimerComponent } from '../../pdfComponent/disclaimer/disclaimer.component';
import { PdfdisclaimerComponent } from '../../pdfComponent/pdfdisclaimer/pdfdisclaimer.component';
import { PdfCentralPatentReferenceComponent } from '../../pdfComponent/pdf-central-patent-reference/pdf-central-patent-reference.component';

@Component({
  selector: 'app-pdf-view',
  imports: [
    CommonModule,
    MatTabGroup,
    MatTab,
    FormsModule,
    RouterModule,
    PdfIntroComponent,
    PdfFeatureMatrixComponent,
    PdfdisclaimerComponent,
    PdfCentralPatentReferenceComponent
  ],
  templateUrl: './pdf-view.component.html',
  styleUrl: './pdf-view.component.scss',
})
export class PdfViewComponent implements OnInit {
  fileId!: number;
  pdfUrl: string = '';
  fileName: string = '';

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  pdfTabs: any[] = [];
  // fileId!: number;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.fileId = +params['fileId'];
      if (this.fileId) {
        this.loadPdfTabs();
      }
    });
  }

  loadPdfTabs(): void {
    this.apiService.getPdfTabs(this.fileId).subscribe({
      next: (data) => {
        this.pdfTabs = data;
        console.log('PDF Tabs:', this.pdfTabs);
      },
      error: (err) => {
        console.error('Failed to fetch PDF tabs:', err);
      },
    });
  }

  get filteredPdfTabs() {
    return this.pdfTabs.filter(
      (tab) =>
        tab.heading === 'INTRO' ||
        tab.heading.toLowerCase().includes('feature matrix') ||
        tab.heading.toLowerCase().includes('disclaimer') ||
        tab.heading.toLowerCase().includes('central')
    );
  }
}