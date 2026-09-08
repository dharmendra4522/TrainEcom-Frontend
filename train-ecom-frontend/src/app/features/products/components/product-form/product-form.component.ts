import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { BrandService } from '../../../../core/services/brand.service';
import { Brand } from '../../../../core/models/brand.model';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/category.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private brandService = inject(BrandService);
  private categoryService = inject(CategoryService);
  private activatedRoute = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private route = inject(Router);

  productForm!: FormGroup;
  fileName: string = '';
  brandData: Brand[] = [];
  categoryData: Category[] = [];
  isEdit: boolean = false;
  productId: string | null = null;
  selectedFile: File[] = [];
  imageUrl: string | null = null;
  existingImages: { id: string; imageUrl: string; isPrimary: boolean }[] = [];
  deletedImageId: string[] = [];

  ngOnInit(): void {
    this.validateForm();
    this.loadBrand();
    this.loadCategory();
    this.catchProductId();
  }

  private validateForm(): void {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required]],
      price: [0, Validators.required],
      quantity: [0, Validators.required],
      brand: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      image: [''],
    });
  }

  private loadBrand(): void {
    this.brandService.getAllBrands().subscribe({
      next: (response) => {
        this.brandData = response;
        console.log(this.brandData);
      },
      error(err) {
        console.log('Brands are not load from server', err);
      },
    });
  }

  private loadCategory(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (response) => {
        this.categoryData = response;
        console.log(this.categoryData);
      },
      error(err) {
        console.log('Category are not load from server', err);
      },
    });
  }

  private catchProductId(): void {
    this.productId = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.productId) {
      this.isEdit = true;
      console.log('id fetch success', this.productId);
      this.loadProductData(this.productId);
    } else {
      this.isEdit = false;
    }
  }

  loadProductData(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        console.log(response);
        this.productForm.patchValue({
          productName: response.name,
          price: response.price,
          quantity: response.stockQuantity,
          brand: response.brandId,
          category: response.categoryId,
          description: response.description,
        });
        if (response.images && response.images.length > 0) {
          const primaryImg = response.images[0];
          console.log(primaryImg);
          this.fileName = primaryImg.imageUrl;
          this.imageUrl = primaryImg.imageUrl;
          this.fileName = '';
          this.existingImages = response.images;
          console.log('existing image', this.existingImages);
        }
      },
      error(err) {
        console.log('Somthing is wrong to load product data', err);
      },
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }
    const formData = this.productForm.value;
    console.log(formData);
    const productPayload = {
      name: formData.productName,
      description: formData.description,
      price: formData.price,
      stockQuantity: formData.quantity,
      brandId: formData.brand,
      categoryId: formData.category,
    };
    if (this.productId && this.isEdit) {
      this.productService
        .updateProduct(this.productId, productPayload, this.selectedFile, this.deletedImageId)
        .subscribe({
          next: (res) => {
            console.log('Product successfully updated', res);
            this.route.navigate(['/admin/products']);
          },
          error(err) {
            console.log('Error updating Prodct', err);
          },
        });
    } else {
      this.productService
        .createProduct(productPayload, this.selectedFile)
        .subscribe({
          next: (res) => {
            console.log('Product add successfully', res);
            this.route.navigate(['/admin/products']);
          },
          error(err) {
            console.log('Somthing went wrong in add product', err);
          },
        });
    }
  }

  removeExistingImage(imageId: string, idx: number): void {
    this.deletedImageId.push(imageId);
    this.existingImages.splice(idx, 1);
  }

  onFileSelected(event: any): void {
    const file = event.target.files;
    if (file && file.length > 0) {
      this.selectedFile = Array.from(file);
      this.productForm.patchValue({
        image: file[0],
      });
      this.productForm.get('image')?.markAsTouched();
    }
  }
}
