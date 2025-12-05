import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { ExcelSheet } from '../../models/excel-sheet.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../auth.service';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  displayedColumns: string[] = ['sno', 'fileName', 'actions'];
  excelData: ExcelSheet[] = [];
  isLoading = false;

  constructor(
    private router: Router,
    private ApiService: ApiService,
    private authService: AuthService,
    private cd: ChangeDetectorRef // ✅ for manual UI refresh
  ) {}

  ngOnInit(): void {
    this.loadSheets();
  }

  loadSheets(): void {
    this.isLoading = true;

    this.ApiService.getMyFiles().subscribe({
      next: (data: ExcelSheet[]) => {
        this.excelData = data;

        // 👇 Optional delay to make spinner visible
        setTimeout(() => {
          this.isLoading = false;
          this.cd.detectChanges(); // ✅ manually trigger refresh
        }, 100); // Adjust delay as needed

        // Optionally log for debug
        console.log('Fetched Sheets:', this.excelData);
      },
      error: (err) => {
        console.error('Failed to fetch sheets:', err);
        this.isLoading = false;
        this.cd.detectChanges(); // ✅ Ensure spinner hides even on error
      },
    });
  }

  deleteSheet(sheetId: number): void {
    if (confirm('Are you sure you want to delete this sheet?')) {
      this.ApiService.deleteSheet(sheetId).subscribe({
        next: () => {
          this.excelData = this.excelData.filter(
            (sheet) => sheet.id !== sheetId
          );
        },
        error: (err) => {
          console.error('Delete failed:', err);
        },
      });
    }
  }

  viewExcelFile(file: any): void {
    if (file.file_name.endsWith('.pdf')) {
      this.router.navigate(['pdf_view'], { queryParams: { fileId: file.id } });
    } else {
      this.router.navigate(['rep_view'], { queryParams: { fileId: file.id } });
    }
  }

  chooseFile(): void {
    this.router.navigate(['upload']);
  }

  editSheet(): void {
    // reserved for later
  }

  logout(): void {
    localStorage.clear();
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
