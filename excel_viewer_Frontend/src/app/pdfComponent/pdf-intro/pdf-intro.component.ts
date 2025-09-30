import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pdf-intro',
  imports: [CommonModule],
  templateUrl: './pdf-intro.component.html',
  styleUrl: './pdf-intro.component.scss',
})
export class PdfIntroComponent implements OnInit {
  @Input() data: string[] = [];
  title: string = '';
  caseNo: string = '';
  date: string = '';

  ngOnInit(): void {
    // Filter lines for required info
    this.title = this.data.find((line) => line.startsWith('TITLE:')) || '';
    this.caseNo = this.data.find((line) => line.startsWith('CASE:')) || '';
    this.date =
      this.data.find(
        (line) =>
          line.match(/\d{2,4}\s?[A-Za-z]{3,}\s?,?\s?\d{4}/) ||
          line.match(/\d{2,4}-\d{2}-\d{2,4}/)
      ) || '';
  }
}