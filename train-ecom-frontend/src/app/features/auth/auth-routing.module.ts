import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { publicGuard } from '../../core/guards/public.guard';
import { authGuard } from '../../core/guards/auth.guard';
import { VendorRegisterComponent } from './vendor-register/vendor-register.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  { path: 'signup', component: RegisterComponent, canActivate: [publicGuard] },
  {
    path: 'vendor-register',
    component: VendorRegisterComponent,
    canActivate: [publicGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
