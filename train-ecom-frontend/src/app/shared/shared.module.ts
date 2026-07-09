import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { TopPromoBarComponent } from './components/top-promo-bar/top-promo-bar.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';


@NgModule({
  declarations: [
    HeaderComponent,
    ProductCardComponent,
    TopPromoBarComponent,
    FooterComponent,
    NotFoundComponent,
    MainLayoutComponent,
    SidebarComponent,
    AuthLayoutComponent
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
    FooterComponent,
    MainLayoutComponent
  ]
})
export class SharedModule { }
