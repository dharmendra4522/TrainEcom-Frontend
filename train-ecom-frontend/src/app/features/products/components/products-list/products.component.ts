import { Component, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ProductService } from '../../../../core/services/product.service';
import { Product } from '../../../../core/models/product.model';
import { Router } from '@angular/router';
import { BrandService } from '../../../../core/services/brand.service';
import { CategoryService } from '../../../../core/services/category.service';
import { Brand } from '../../../../core/models/brand.model';
import { Category } from '../../../../core/models/category.model';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css',
})
export class ProductsComponent {
  private productService = inject(ProductService);
  private router = inject(Router);
  private brandService = inject(BrandService);
  private categoryService = inject(CategoryService);

  dataSource = new MatTableDataSource<Product>([]);

  displayColumns: string[] = [
    'index',
    'name',
    'description',
    'brandName',
    'categoryName',
    'price',
    'stockQuantity',
    'thumbnailUrl',
    'action',
  ];

  brandData: Brand[] = [];
  categoryData: Category[] = [];

  ngOnInit() {
    this.loadProduct();
    this.loadBrand();
    this.loadCategory();
  }

  private loadProduct(): void {
    this.productService.getAllProducts().subscribe({
      next: (response) => {
        const productData: Product[] = response;
        this.dataSource.data = productData.map((product) => ({
          ...product,
          description: this.transform(product.description),
        }));
      },
      error(err) {
        console.log('Error fetching product', err);
      },
    });
  }

  private loadBrand(): void {
    this.brandService.getAllBrands().subscribe({
      next: (response) => {
        this.brandData = response;
      },
      error(err) {
        console.log('Error to fetch brands', err);
      },
    });
  }

  private loadCategory(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categoryData = response;
      },
      error(err) {
        console.log('Error to fetch category', err);
      },
    });
  }

  private transform(description: string): string {
    if (!description) return '';
    return description.substring(0, 10) + '...';
  }

  onSearch(searchTerm: string): void {
    this.dataSource.filter = searchTerm.trim().toLowerCase();
  }

  onEdit(id: string): void {
    console.log('Edit product', id);
    this.router.navigate(['/admin/products/edit', id]);
  }

  onDelete(id: string): void {
    alert(`Are you Sure to delete this ${id} product`);
    console.log('Delete product', id);
  }
}
