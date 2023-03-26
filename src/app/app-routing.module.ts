import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ManageUsersComponent } from './pages/manage-users/manage-users.component';
import { HomeComponent } from './pages/home/home.component';
import { SurveyComponent } from './pages/survey/survey.component';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';
import { canActivateByRoles } from './guards/admin.guard';

const redirectToHome = () => redirectUnauthorizedTo(['/']);

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [canActivateByRoles, AngularFireAuthGuard], data: { authGuardPipe: redirectToHome, roles: ["user", "admin"] }, pathMatch: 'full' },
  { path: 'manage-users', component: ManageUsersComponent, canActivate: [canActivateByRoles, AngularFireAuthGuard], data: { authGuardPipe: redirectToHome, roles: ["admin"] }, pathMatch: 'full' },
  { path: 'survey/:id', component: SurveyComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '/' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
