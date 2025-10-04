import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pdf-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-intro.component.html',
  styleUrl: './pdf-intro.component.scss',
})
export class PdfIntroComponent implements OnInit {
  @Input() data: string[] = [];
  fileName: string = '';
  titleLines: string[] = [];
  caseNo: string = '';
  date: string = '';

  ngOnInit(): void {
    // 1. File name/heading
    this.fileName =
      this.data.find(
        (line) =>
          line.toLowerCase().includes('patentability search report') ||
          line.toLowerCase().includes('patentability search')
      ) || '';

    // 2. Title (multi-line, between "TITLE:" and "CASE:" or date)
    let titleStart = this.data.findIndex((line) =>
      line.trim().toLowerCase().startsWith('title')
    );
    this.titleLines = [];
    if (titleStart !== -1) {
      for (let i = titleStart + 1; i < this.data.length; i++) {
        const line = this.data[i].trim();
        if (
          line.toLowerCase().startsWith('case') ||
          line.match(/\d{2,4}\s?[A-Za-z]{3,}\s?,?\s?\d{4}/)
        ) {
          break;
        }
        this.titleLines.push(line);
      }
    }

    // 3. Case
    this.caseNo =
      this.data.find((line) => line.trim().toLowerCase().startsWith('case')) ||
      '';

    // 4. Date
    this.date =
      this.data.find(
        (line) =>
          line.match(/\d{2,4}\s?[A-Za-z]{3,}\s?,?\s?\d{4}/) ||
          line.match(/\d{2,4}-\d{2}-\d{2,4}/)
      ) || '';
  }
}