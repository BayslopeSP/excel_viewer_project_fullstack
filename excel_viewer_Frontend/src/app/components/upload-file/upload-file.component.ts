import { Component } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-upload-file',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss'],
})
export class UploadFileComponent {
  sheetsData: any[] = [];
  excelFileId!: number;
  selectedFileName = '';
  isLoading = false;

  constructor(private apiService: ApiService, private snackBar: MatSnackBar) {}

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];

    if (file) {
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
        'application/pdf', // .pdf
      ];

      if (!allowedTypes.includes(file.type)) {
        this.snackBar.open('❌ Only Excel or PDF files are allowed!', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
        });
        return;
      }
      this.selectedFileName = file.name;
      this.isLoading = true;

      const formData = new FormData();
      formData.append('file', file);

      this.apiService.uploadExcel(file).subscribe({
        next: (res) => {
          console.log('Upload success:', res);
          this.sheetsData = res.sheets;
          this.excelFileId = res.excel_file_id;
          this.isLoading = false;
          this.snackBar.open('✔ File uploaded successfully!', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
        },
        error: (err) => {
          console.error('Upload failed:', err);
          this.isLoading = false;
          this.snackBar.open('❌ Upload failed. Try again!', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar'],
          });
        },
      });
    }
  }
}
