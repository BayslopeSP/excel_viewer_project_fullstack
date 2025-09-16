import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // private baseUrl = 'http://localhost:8000/api';
  private baseUrl = 'https://excel-viewer-project-fullstack.onrender.com/api';

  constructor(private http: HttpClient) {}

  uploadExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/upload-excel/`, formData);
  }

  getAllSheets(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sheets/`);
  }

  getExcelFileById(fileId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/sheets/${fileId}/`);
  }

  deleteSheet(sheetId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/excel-files/${sheetId}/delete/`);
  }

  updateSheet(sheetId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.put(`${this.baseUrl}/update-sheet/${sheetId}/`, formData);
  }
}
