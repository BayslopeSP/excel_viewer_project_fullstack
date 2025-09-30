import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-pdf-feature-matrix',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-feature-matrix.component.html',
  styleUrl: './pdf-feature-matrix.component.scss',
})
export class PdfFeatureMatrixComponent implements OnInit {
  @Input() data: any[] = [];
  tables: any[][][] = [];
  legends: string[] = [];

  ngOnInit(): void {
    console.log('Feature Matrix Data:', this.data); // <-- Yahan lagao

    this.tables = [];
    this.legends = [];
    let start = false;
    let foundCentralReferences = false;
    let lastLegend: string | null = null;

    for (const item of this.data) {
      if (!start && item.table) {
        start = true;
        this.tables.push(item.table); // Pehli table bhi dikhani hai
        console.log('First table:', item.table); // <-- Yahan bhi
        continue;
      }
      if (start && !foundCentralReferences) {
        if (
          typeof item === 'string' &&
          item.toLowerCase().replace(/\s+/g, '').includes('centralreferences')
        ) {
          foundCentralReferences = true;
          console.log('Found Central References, stopping at:', item); // <-- Yahan bhi
          break;
        }
        if (item.table) {
          this.tables.push(item.table);
          console.log('Table found:', item.table); // <-- Yahan bhi
        }
        if (typeof item === 'string' && item.toLowerCase().includes('legend')) {
          lastLegend = item;
          console.log('Legend found:', item); // <-- Yahan bhi
        }
      }
    }
    if (lastLegend) {
      this.legends.push(lastLegend);
    }
    console.log('Final Tables:', this.tables); // <-- Final tables
    console.log('Final Legends:', this.legends); // <-- Final legends
  }
}
