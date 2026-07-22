import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './components/products-list/products.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { authGuard } from '../../core/guards/auth.guard';
import { adminGuard } from '../../core/guards/admin.guard';

const routes: Routes = [
  { path: 'add', canActivate: [authGuard, adminGuard], component: ProductFormComponent },
  { path: 'edit/:id', canActivate: [authGuard, adminGuard], component: ProductFormComponent },
  { path: ':id', component: ProductDetailComponent },
  { path: '', canActivate: [authGuard, adminGuard], component: ProductsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
