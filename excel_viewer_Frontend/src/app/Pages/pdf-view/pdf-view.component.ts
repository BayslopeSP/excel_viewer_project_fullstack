import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SafePipe } from '../../safe.pipe';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pdf-view',
  imports: [CommonModule,MatTabGroup,MatTab,FormsModule,RouterModule],
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
  this.route.queryParams.subscribe(params => {
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
    }
  });
}}