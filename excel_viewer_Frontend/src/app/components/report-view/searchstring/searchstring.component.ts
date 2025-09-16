import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-searchstring',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './searchstring.component.html',
  styleUrls: ['./searchstring.component.scss']
})
export class SearchstringComponent implements OnInit {
  @Input() sheetData: any;

  balaceraQueries: string[] = [];
  googleQueries: string[] = [];
  ipcQueries: string[] = [];
  assigneeList: string[] = [];

  ngOnInit(): void {
    if (!this.sheetData || !this.sheetData.rows) return;

    const rows = this.sheetData.rows;

    const getTextRows = (startText: string, endText?: string): string[] => {
      const start = rows.findIndex((r: any[]) =>
        r.some(c => typeof c?.value === 'string' && c.value.toLowerCase() === startText.toLowerCase())
      );

      const end = endText
        ? rows.findIndex((r: any[]) =>
            r.some(c => typeof c?.value === 'string' && c.value.toLowerCase() === endText.toLowerCase())
          )
        : rows.length;

      if (start === -1) return [];

      return rows
        .slice(start + 2, end === -1 ? rows.length : end)
        .map((r: any[]) =>
          r.map(c => (typeof c?.value === 'string' ? c.value : '')).join('')
        )
        .filter((line: string) => line.trim());
    };

    this.balaceraQueries = getTextRows('Search - Balacera', 'Google Patent');
    this.googleQueries = getTextRows('Google Patent', 'IPC/CPC');
    this.ipcQueries = getTextRows('IPC/CPC', 'Assignee');
    this.assigneeList = getTextRows('Assignee');
  }
}
