import { Routes } from '@angular/router';
import { UploadFileComponent } from './components/upload-file/upload-file.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ReportViewComponent } from './components/report-view/report-view.component';
import { MappingComponent } from './components/report-view/mapping/mapping.component';
import { MatrixComponent } from './components/report-view/matrix/matrix.component';
// import { ReportCreate2Component } from './components/report-create-2/report-create-2.component';

export const routes: Routes = [
  {
    path: 'upload',
    component: UploadFileComponent
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  // { path: 'create', component: ReportCreate2Component },
  { path: 'rep_view', component: ReportViewComponent} ,
  // { path: 'app-mapping', component: MappingComponent },
    { 
    path: 'mapping', 
    component: MappingComponent   // 👈 add this
  }]
;
