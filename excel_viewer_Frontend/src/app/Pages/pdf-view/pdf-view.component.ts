import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { PdfIntroComponent } from '../../pdfComponent/pdf-intro/pdf-intro.component';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { PdfFeatureMatrixComponent } from '../../pdfComponent/pdf-feature-matrix/pdf-feature-matrix.component';

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
  ],
  templateUrl: './pdf-view.component.html',
  styleUrl: './pdf-view.component.scss',
})
export class PdfViewComponent implements OnInit {
  fileId!: number;
  introLines: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.fileId = +params['fileId'];
      if (this.fileId) {
        this.loadPdfFull();
      }
    });
  }
  featureMatrixLines: any[] = [];

  extractFeatureMatrix(data: any[]): any[] {
    const featureMatrix: any[] = [];
    let start = false;
    for (const line of data) {
      if (
        typeof line === 'string' &&
        line
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .includes('15featurematrix')
      ) {
        start = true;
        continue;
      }
      if (
        start &&
        typeof line === 'string' &&
        line
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .includes('2centralreferences')
      ) {
        break;
      }
      if (start) {
        featureMatrix.push(line);
      }
    }
    return featureMatrix;
  }

  loadPdfFull(): void {
    this.apiService.getPdfFull(this.fileId).subscribe({
      next: (data) => {
        this.introLines = this.extractIntro(data);

        console.log('Intro Lines:', this.introLines);
        this.featureMatrixLines = this.extractFeatureMatrix(data);
        console.log('Feature Matrix Lines:', this.featureMatrixLines);
        this.cdr.detectChanges(); // Force Angular to update the view
        // console.log('Intro Lines:', this.introLines);
      },
      error: (err) => {
        console.error('Failed to fetch PDF full:', err);
      },
    });
  }

  extractIntro(data: string[]): string[] {
    const intro: string[] = [];
    for (const line of data) {
      if (
        (typeof line === 'string' && line.match(/^\d+\.\d+/)) ||
        (typeof line === 'string' &&
          line.toLowerCase().includes('feature matrix')) ||
        (typeof line === 'string' &&
          line.toLowerCase().includes('central references')) ||
        (typeof line === 'string' && line.toLowerCase().includes('disclaimer'))
      ) {
        break;
      }
      intro.push(line);
    }
    return intro;
  }
}
