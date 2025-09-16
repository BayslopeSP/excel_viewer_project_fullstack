import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service'; // Adjust path as needed
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-upload-file',

  imports: [CommonModule,RouterLink],
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss']
})
export class UploadFileComponent {
  sheetsData: any[] = [];
  excelFileId!: number;

  constructor(private apiService: ApiService) {}

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      this.apiService.uploadExcel(file).subscribe({
        next: (res) => {
          console.log('Upload success:', res);
          this.sheetsData = res.sheets;
          this.excelFileId = res.excel_file_id;
        },
        error: (err) => {
          console.error('Upload failed:', err);
        }
      });
    }
  }
}
