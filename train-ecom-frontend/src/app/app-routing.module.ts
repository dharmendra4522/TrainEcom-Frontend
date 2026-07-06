import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  { path: 'login', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
  
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  { path: '**', redirectTo: 'home', pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
