import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css',
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  productForm!: FormGroup;

  ngOnInit(): void {
    this.validateForm();
  }

  private validateForm(): void {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required]],
      price: [0, Validators.required],
      quantity: [0, Validators.required],
      brand: ['', Validators.required],
      category: ['', Validators.required],
      description: ['', Validators.required],
      image: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if(this.productForm.invalid){
      return;
    }
    const formData = this.productForm.value;
    console.log(formData);
  }
}
