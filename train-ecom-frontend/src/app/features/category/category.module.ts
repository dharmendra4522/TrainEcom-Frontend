import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoryRoutingModule } from './category-routing.module';
import { CategoryComponent } from './components/category/category.component';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SubCategoryComponent } from './components/sub-category/sub-category.component';
import { ParentCategoryComponent } from './components/parent-category/parent-category.component';


@NgModule({
  declarations: [
    CategoryComponent,
    SubCategoryComponent,
    ParentCategoryComponent
  ],
  imports: [
    CommonModule,
    CategoryRoutingModule,
    SharedModule  ,
    ReactiveFormsModule
  ]
})
export class CategoryModule { }
