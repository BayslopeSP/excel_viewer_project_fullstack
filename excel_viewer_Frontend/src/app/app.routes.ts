import { Routes } from '@angular/router';
import { UploadFileComponent } from './components/upload-file/upload-file.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ReportViewComponent } from './components/report-view/report-view.component';
import { MappingComponent } from './components/report-view/mapping/mapping.component';
import { MatrixComponent } from './components/report-view/matrix/matrix.component';
import { LoginComponent } from './Pages/login/login.component';
import { SignupComponent } from './Pages/signup/signup.component';
import { AdminDashboardComponent } from './Pages/admin-dashboard/admin-dashboard.component';
import { ClientDashboardComponent } from './Pages/client-dashboard/client-dashboard.component';
import { PdfViewComponent } from './Pages/pdf-view/pdf-view.component';
// import { ReportCreate2Component } from './components/report-create-2/report-create-2.component';

export const routes: Routes = [
  {
    path: 'upload',
    component: UploadFileComponent,
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  // { path: 'create', component: ReportCreate2Component },
  { path: 'rep_view', component: ReportViewComponent },
  { path: 'pdf_view', component: PdfViewComponent },
  // { path: 'pdf_view/:id', component: PdfViewComponent },
  // { path: 'app-mapping', component: MappingComponent },
  {
    path: 'mapping',
    component: MappingComponent, // 👈 add this
  },
  { path: '', component: LoginComponent,pathMatch: 'full', },
  { path: 'signup', component: SignupComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'client', component: ClientDashboardComponent },
  // { path: '', redirectTo: '/login', pathMatch: 'full' },
];
;
