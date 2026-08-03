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
import { RoleDirective } from './directives/role.directive';
import { GenericDialogComponent } from './components/generic-dialog/generic-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SidePanelComponent } from './components/side-panel/side-panel.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { GenericTableComponent } from './components/generic-table/generic-table.component';
import { GroupedProductRowComponent } from './components/grouped-product-row/grouped-product-row.component';
import { SideItemCardComponent } from './components/side-item-card/side-item-card.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { SelectionDialogComponent } from './components/selection-dialog/selection-dialog.component';
import { ImgFallbackDirective } from './directives/img-fallback.directive';


@NgModule({
  declarations: [
    HeaderComponent,
    ProductCardComponent,
    TopPromoBarComponent,
    FooterComponent,
    NotFoundComponent,
    MainLayoutComponent,
    SidebarComponent,
    AuthLayoutComponent,
    RoleDirective,
    GenericDialogComponent,
    SidePanelComponent,
    ProductFilterComponent,
    GenericTableComponent,
    GroupedProductRowComponent,
    SideItemCardComponent,
    ConfirmDialogComponent,
    SelectionDialogComponent,
    ImgFallbackDirective,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    ReactiveFormsModule

  ],
  exports: [
    HeaderComponent,
    ProductCardComponent,
    MaterialModule,
    TopPromoBarComponent,
    FooterComponent,
    MainLayoutComponent,
    RoleDirective,
    GenericDialogComponent,
    SidebarComponent,
    GenericTableComponent,
    GroupedProductRowComponent,
    SideItemCardComponent,
    SidePanelComponent,
    ProductFilterComponent,
    ImgFallbackDirective,

  ]
})
export class SharedModule { }
