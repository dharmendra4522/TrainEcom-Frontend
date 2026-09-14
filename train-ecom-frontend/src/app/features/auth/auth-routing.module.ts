import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { publicGuard } from '../../core/guards/public.guard';
import { VendorRegisterComponent } from './vendor-register/vendor-register.component';
import { VendorBusinessDetailsComponent } from './vendor-business-details/vendor-business-details.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  { path: 'signup', component: RegisterComponent, canActivate: [publicGuard] },
  {
    path: 'vendor-register',
    component: VendorRegisterComponent,
    canActivate: [publicGuard],
  },
  {
    path: 'vendor-business-details',
    component: VendorBusinessDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
