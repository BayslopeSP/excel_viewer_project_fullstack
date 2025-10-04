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
  results: { label: string; tables: any[][][] }[] = [];
  selectedResultIndex: number = 0;

  ngOnInit(): void {
    this.results = [];
    for (const item of this.data) {
      if (item.result_heading && Array.isArray(item.content)) {
        const tables: any[][][] = [];
        for (const line of item.content) {
          if (line && line.table) {
            tables.push(line.table);
          }
        }
        this.results.push({
          label: item.result_heading,
          tables,
        });
      }
    }
    console.log('Central Reference Results:', this.results);
  }

  selectResult(index: number) {
    this.selectedResultIndex = index;
  }
}