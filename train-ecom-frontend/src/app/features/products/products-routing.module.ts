import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './components/products-list/products.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/admin.guard';
import { PublicCatalogComponent } from './components/public-catalog/public-catalog.component';


const routes: Routes = [
  { path: '', component: PublicCatalogComponent },
  {
    path: 'manage',
    canActivate: [authGuard, adminGuard],
    component: ProductsComponent,
  },
  {
    path: 'add',
    canActivate: [authGuard, adminGuard],
    component: ProductFormComponent,
  },
  {
    path: 'edit/:id',
    canActivate: [authGuard, adminGuard],
    component: ProductFormComponent,
  },

  // Admin View - Uses ProductDetailComponent with isAdmin: true
  {
    path: 'view/:id',
    canActivate: [authGuard, adminGuard],
    component: ProductDetailComponent,
    data: { isAdmin: true },
  },

  // Public View - Uses ProductDetailComponent with isAdmin: false
  {
    path: ':id',
    component: ProductDetailComponent,
    data: { isAdmin: false },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRoutingModule {}
