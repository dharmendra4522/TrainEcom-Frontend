import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductsComponent } from './products/products.component';
import { ProfileComponent } from '../consumer/profile/profile.component';
import { BrandComponent } from './brand/brand.component';
import { CategoryComponent } from './category/category.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  {path: 'profile', component: ProfileComponent},

  { path: 'dashboard', component: DashboardComponent },

  { path: 'products', component: ProductsComponent },
  { path: 'brands', component: BrandComponent },
  { path: 'categories', component: CategoryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }