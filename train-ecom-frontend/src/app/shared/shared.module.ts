import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { ProductCardComponent } from './components/product-card/product-card.component';

@NgModule({
  declarations: [
    HeaderComponent,
    ProductCardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule
  ],
  exports: [
    HeaderComponent,
    ProductCardComponent
  ]
})
export class SharedModule { }
