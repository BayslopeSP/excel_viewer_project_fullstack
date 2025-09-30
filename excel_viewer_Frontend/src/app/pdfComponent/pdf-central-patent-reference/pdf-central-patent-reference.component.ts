import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pdf-central-patent-reference',
  standalone: true,
  templateUrl: './pdf-central-patent-reference.component.html',
  styleUrl: './pdf-central-patent-reference.component.scss',
  imports: [CommonModule],
})
export class PdfCentralPatentReferenceComponent implements OnInit {
  @Input() data: any[] = [];
  results: { label: string; table: any[][] }[] = [];
  selectedResultIndex: number = 0;

  ngOnInit(): void {
    this.results = [];
    for (const item of this.data) {
      if (item.result_heading && Array.isArray(item.content)) {
        // Find table header
        let table: any[][] = [];
        let headerRow: string[] = [];
        let rows: string[][] = [];
        let headerFound = false;
        for (let i = 0; i < item.content.length; i++) {
          const line = item.content[i];
          if (
            typeof line === 'string' &&
            line.toLowerCase().includes('s. no. key features relevant text for')
          ) {
            headerRow = [line];
            headerFound = true;
            continue;
          }
          if (headerFound && typeof line === 'string') {
            // Stop at next result_heading or empty line
            if (
              (typeof line === 'string' &&
                line.toLowerCase().includes('result')) ||
              line.trim() === ''
            ) {
              break;
            }
            rows.push([line]);
          }
        }
        if (headerRow.length > 0 && rows.length > 0) {
          table = [headerRow, ...rows];
        }
        this.results.push({ label: item.result_heading, table });
      }
    }
    console.log('Central Reference Results:', this.results);
  }

  selectResult(index: number) {
    this.selectedResultIndex = index;
  }
}