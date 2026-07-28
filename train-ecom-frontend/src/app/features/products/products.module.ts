import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { ProductsComponent } from './components/products-list/products.component';
import { SharedModule } from '../../shared/shared.module';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { PublicCatalogComponent } from './components/public-catalog/public-catalog.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AdminProductDetailComponent } from './components/admin-product-detail/admin-product-detail.component';

@NgModule({
  declarations: [
    ProductsComponent,
    ProductFormComponent,
    ProductDetailComponent,
    PublicCatalogComponent,
    AdminProductDetailComponent,
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    ScrollingModule,
  ],
})
export class ProductsModule {}
