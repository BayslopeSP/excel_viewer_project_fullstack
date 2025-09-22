import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { ExcelSheet } from '../../models/excel-sheet.model';
import { ApiService } from '../../services/api.service';
import { ReportViewComponent } from '../report-view/report-view.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule,MatCardModule,MatIconModule,MatButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  excelData: ExcelSheet[] = [];
  isLoading = false;

  constructor(
    private router: Router,
    private ApiService: ApiService
  ){}

  createReport() {
    this.router.navigate([`create`], { queryParams: { isNew: true } });
  }
  ngOnInit(): void {
    this.loadSheets();
  }
  
  loadSheets(): void {
    this.isLoading = true;
    this.ApiService.getAllSheets().subscribe({
      next: (data: ExcelSheet[]) => {
        this.excelData = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch sheets:', err);
        this.isLoading = false;
      }
    });
  }

  deleteSheet(sheetId: number): void {
    if (confirm('Are you sure you want to delete this sheet?')) {
      this.ApiService.deleteSheet(sheetId).subscribe({
        next: () => {
          this.excelData = this.excelData.filter(sheet => sheet.id !== sheetId);
        },
        error: err => {
          console.error('Delete failed:', err);
        }
      });
    }
  }

  viewExcelFile(sheetId: number):void {
    this.router.navigate(['rep_view'], { queryParams: { sheetId: sheetId } });
  }


  chooseFile(){
    this.router.navigate(['upload']);
  }
  editSheet(){
  // }




//

  //
  }
}
