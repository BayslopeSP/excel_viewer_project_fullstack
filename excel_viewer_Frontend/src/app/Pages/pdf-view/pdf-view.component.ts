import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { ActivatedRoute } from '@angular/router';
import { SafePipe } from '../../safe.pipe';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pdf-view',
  imports: [CommonModule,SafePipe],
  templateUrl: './pdf-view.component.html',
  styleUrl: './pdf-view.component.scss',
})
export class PdfViewComponent implements OnInit {
  fileId!: number;
  pdfUrl: string = '';
  fileName: string = '';

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

ngOnInit(): void {
  this.route.queryParams.subscribe(params => {
    this.fileId = +params['fileId'];
    if (this.fileId) {
      this.loadPdf();
    }
  });
}

loadPdf(): void {
  this.apiService.getExcelFileById(this.fileId).subscribe({
    next: (data) => {
      console.log('PDF API Response:', data); 
      this.pdfUrl = data.file_url;
      this.fileName = data.file_name;
    },
    error: (err) => {
      console.error('Failed to fetch PDF:', err);
    }
  });
}
}