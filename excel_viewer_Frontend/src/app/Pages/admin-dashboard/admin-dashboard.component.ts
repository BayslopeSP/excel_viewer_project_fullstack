import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  clients: any[] = [];
  selectedClient: any = null;
  files: any[] = [];
  file: File | null = null;
  message = '';

  constructor(
    private fileService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.fileService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: () => {
        this.message = 'Failed to load clients!';
      },
    });
  }

  onClientChange() {
    this.files = [];
    this.message = '';
    if (this.selectedClient) {
      this.fileService.getClientFiles(this.selectedClient.id).subscribe({
        next: (data) => {
          this.files = data;
        },
        error: () => {
          this.message = 'Failed to load files!';
        },
      });
    }
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
  }

  uploadFile() {
    if (this.selectedClient && this.file) {
      this.fileService.uploadFile(this.selectedClient.id, this.file).subscribe({
        next: () => {
          this.message = 'File uploaded!';
          this.onClientChange();
        },
        error: () => {
          this.message = 'Upload failed!';
        },
      });
    }
  }
  logout() {
    this.authService.logout();
  }
}
