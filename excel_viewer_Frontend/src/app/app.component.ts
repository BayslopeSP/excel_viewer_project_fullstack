import { Component, NgModule, OnInit } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [CommonModule,RouterOutlet,FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  logoStyle: any = { height: '50px', width: 'auto' }; 

  title = 'excel-viewer-app';
  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
   
      if (this.router.url.includes('/reports/')) {
           this.logoStyle = { height: '30px', width: 'auto' };
      } else {
           this.logoStyle = { height: '50px', width: 'auto' };
      }
    });
  }
}
