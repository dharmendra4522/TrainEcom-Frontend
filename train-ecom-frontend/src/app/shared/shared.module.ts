import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { TopPromoBarComponent } from './components/top-promo-bar/top-promo-bar.component';

@NgModule({
  declarations: [
    HeaderComponent,
    ProductCardComponent,
    TopPromoBarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    
  ],
  exports: [
    HeaderComponent,
    ProductCardComponent,
    MaterialModule,
    TopPromoBarComponent,
  ]
})
export class SharedModule { }
