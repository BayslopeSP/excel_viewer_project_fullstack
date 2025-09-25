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
  getSheetById(sheetId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/sheets/${sheetId}/`);
  }

  deleteSheet(sheetId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/excel-files/${sheetId}/delete/`);
  }

  updateSheet(sheetId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.put(`${this.baseUrl}/update-sheet/${sheetId}/`, formData);
  }
  uploadFile(clientId: number, file: File) {
    const formData = new FormData();
    formData.append('user_id', clientId.toString());
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/upload-file/`, formData);
  }
  getClients() {
    return this.http.get<any[]>(`${this.baseUrl}/clients/`);
  }

  getClientFiles(clientId: number) {
    return this.http.get<any[]>(
      `${this.baseUrl}/admin/client/${clientId}/files/`
    );
  }
  getMyFiles() {
    return this.http.get<any[]>(`${this.baseUrl}/client/files/`);
  }
}
