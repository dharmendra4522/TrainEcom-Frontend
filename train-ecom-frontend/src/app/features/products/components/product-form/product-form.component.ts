import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { BrandService } from '../../../../core/services/brand.service';
import { Brand } from '../../../../core/models/brand.model';
import { CategoryService } from '../../../../core/services/category.service';
import { Category } from '../../../../core/models/category.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../../../core/models/product.model';
import { NotificationService } from '../../../../core/services/notification.service';
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
  private notificationService = inject(NotificationService);

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
  newImagePreview: string[] = [];

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
      this.loadProductData(this.productId);
    } else {
      this.isEdit = false;
    }
  }

  loadProductData(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (response) => {
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
          this.fileName = primaryImg.imageUrl;
          this.imageUrl = primaryImg.imageUrl;
          this.fileName = '';
          this.existingImages = response.images;
        }
      },
      error(err) {
        console.log('Somthing is wrong to load product data', err);
      },
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.notificationService.showWarning('Please fill all required field');
      return;
    }
    const formData = this.productForm.value;
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
        .updateProduct(
          this.productId,
          productPayload,
          this.selectedFile,
          this.deletedImageId,
        )
        .subscribe({
          next: (res) => {
            this.notificationService.showSuccess(
              'Product successfully updated',
            );
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
            this.notificationService.showSuccess('Product add successfully');
            this.route.navigate(['/admin/products']);
          },
          error: (err) => {
            this.notificationService.showError(
              'Somthing went wrong in add product',
            );
            console.log('Error:', err);
          },
        });
    }
  }

  removeExistingImage(imageId: string, idx: number): void {
    this.deletedImageId.push(imageId);
    this.existingImages.splice(idx, 1);
  }

  onFileSelected(event: Event): void {
    const inputEle = event.target as HTMLInputElement;
    const file = inputEle.files;
    if (file && file.length > 0) {
      const newFileArray = Array.from(file);
      const allowTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      const maxFileSixe = 5 * 1024 * 1024;

      for (const singleFile of newFileArray) {
        if (!allowTypes.includes(singleFile.type)) {
          this.notificationService.showError(
            'Only JPEG, JPG,PNG and WEBP formate is supperted',
          );
          inputEle.value = '';
          return;
        }
        if (singleFile.size > maxFileSixe) {
          this.notificationService.showError(
            'Please Upload maximum 5MB file size',
          );
          inputEle.value = '';
          return;
        }
      }

      this.selectedFile = [...this.selectedFile, ...newFileArray];
      this.fileName = `${this.selectedFile.length} files selected`;
      Array.from(file).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          if (e.target?.result) {
            this.newImagePreview.push(e.target?.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
      this.productForm.patchValue({
        image: file[0],
      });
      this.productForm.get('image')?.markAsTouched();
      inputEle.value = '';
    }
  }

  removeNewImg(idx: number): void {
    this.newImagePreview.splice(idx, 1);
    this.selectedFile.splice(idx, 1);
    if (this.newImagePreview.length === 0 && this.existingImages.length === 0) {
      this.fileName = '';
      this.productForm.patchValue({ image: '' });
    } else {
      this.fileName = `${this.newImagePreview.length} new files selected`;
    }
  }
}
