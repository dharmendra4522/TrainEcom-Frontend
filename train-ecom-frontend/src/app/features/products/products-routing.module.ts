import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductsComponent } from './components/products-list/products.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { authGuard } from '../../core/guards/auth.guard';
import { PublicCatalogComponent } from './components/public-catalog/public-catalog.component';
import { managementAccessGuard } from '../../core/guards/management-access.guard';

const managementRouteData = {
  feature: 'products.manage',
  pageMode: 'management',
};


const routes: Routes = [
  { path: '', pathMatch: 'full', component: PublicCatalogComponent },
  {
    path: 'manage',
    canActivate: [authGuard, managementAccessGuard],
    component: ProductsComponent,
    data: managementRouteData,
  },
  {
    path: 'add',
    canActivate: [authGuard, managementAccessGuard],
    component: ProductFormComponent,
    data: managementRouteData,
  },
  {
    path: 'edit/:id',
    canActivate: [authGuard, managementAccessGuard],
    component: ProductFormComponent,
    data: managementRouteData,
  },

  // Management view is shared by every configured portal.
  {
    path: 'view/:id',
    canActivate: [authGuard, managementAccessGuard],
    component: ProductDetailComponent,
    data: managementRouteData,
  },

  // Public view keeps customer actions enabled.
  {
    path: ':id',
    component: ProductDetailComponent,
    data: { pageMode: 'public' },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductsRoutingModule {}
