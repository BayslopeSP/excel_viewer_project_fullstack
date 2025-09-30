import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
@Component({
  selector: 'app-pdfdisclaimer',
  imports: [CommonModule],
  templateUrl: './pdfdisclaimer.component.html',
  styleUrl: './pdfdisclaimer.component.scss',
})
export class PdfdisclaimerComponent implements OnInit {
  @Input() data: any[] = [];
  disclaimerLines: string[] = [];

  ngOnInit(): void {
    // Sirf pehli 5 lines chahiye
    this.disclaimerLines = this.data.slice(0, 5);
  }
}