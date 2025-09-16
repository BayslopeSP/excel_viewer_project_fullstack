import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { Sheet } from '../../../models/excel-sheet.model';

@Component({
  selector: 'app-disclaimer',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule],
  templateUrl: './disclaimer.component.html',
  styleUrl: './disclaimer.component.scss'
})
export class DisclaimerComponent implements OnChanges {
  @Input() sheet?: Sheet;

  disclaimerText: string = '';
  disclaimerText1:string='';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['sheet'] && this.sheet?.rows?.length) {
      this.extractDisclaimer();
      this.extractDisclaimer1();
    }
  }

  extractDisclaimer(): void {
    const disclaimerRow = this.sheet?.rows?.[3]; // Assuming row 3 contains the main disclaimer text
    this.disclaimerText = disclaimerRow?.[0]?.value ?? '';
  }
  extractDisclaimer1(): void {
    const disclaimerRow = this.sheet?.rows?.[4]; // Assuming row 3 contains the main disclaimer text
    this.disclaimerText1 = disclaimerRow?.[0]?.value ?? '';
  }
}
