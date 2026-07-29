import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { OrderService } from '../../../../core/services/order.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  BuyNowRequest,
  CreateOrderRequest,
  CreateOrderResponse,
  PaymentMethod,
} from '../../../../core/models/order.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs/internal/Subject';
import { Address } from '../../../../core/models/user.model';
import { switchMap, takeUntil, of, combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import * as ProductActions from '../../../../core/store/product/product.action';
import { selectProductById } from '../../../../core/store/product/product.selectors';
import {
  selectCartItems,
  selectCartTotalAmount,
} from '../../../../core/store/cart/cart.selectors';
import { GenericDialogComponent } from '../../../../shared/components/generic-dialog/generic-dialog.component';
import { Validators } from '@angular/forms';
import * as CartActions from '../../../../core/store/cart/cart.actions';
import { DialogData } from '../../../../core/models/dialog.model';
import { CheckoutItem } from '../../../../core/models/order.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private orderService = inject(OrderService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);
  private destroy$ = new Subject<void>();
  private store = inject(Store);

  isDirectBuy: boolean = false;
  directProductId: string | null = null;
  directQty: number | null = null;

  addresses: Address[] = [];
  selectedAddress: Address | null = null;
  selectedAddressid: string | null = null;

  checkoutItems: CheckoutItem[] = [];
  subtotal: number = 0;
  shippingCost: number = 0;
  grandTotal: number = 0;

  paymentMethods: PaymentMethod = PaymentMethod.CashOnDelivery;
  isSubmitting: boolean = false;

  PaymentMethod = PaymentMethod; // Expose the enum to the template

  ngOnInit(): void {
    this.loadUserAddresses();
    this.parseRouteParamsAndSetContext();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserAddresses(): void {
    this.userService
      .getAllAddress()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.addresses = data || [];
          const defaultAddress = this.addresses.find(
            (address) => address.isDefault,
          );
          if (defaultAddress) {
            this.selectedAddressid = defaultAddress.id;
          } else if (this.addresses.length > 0) {
            this.selectedAddressid = this.addresses[0].id;
          }
        },
        error: (err) => {
          console.error('Error fetching addresses:', err);
        },
      });
  }

  private parseRouteParamsAndSetContext(): void {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const prodId = params.get('productId');
        const qtyParam = params.get('quantity');
        const qty = qtyParam ? +qtyParam : 1;

        if (prodId) {
          this.isDirectBuy = true;
          this.directProductId = prodId;
          this.directQty = qty;
          this.loadDirectProductDetails(prodId, qty);
        } else {
          this.isDirectBuy = false;
          this.loadCartDetails();
        }
      });
  }

  private loadDirectProductDetails(productId: string, quantity: number): void {
    this.store.dispatch(ProductActions.loadProductById({ id: productId }));

    this.store
      .select(selectProductById(productId))
      .pipe(
        takeUntil(this.destroy$),
        switchMap((product) => {
          if (product) {
            return of(product);
          }
          return of(null);
        }),
      )
      .subscribe((product) => {
        if (product) {
          this.checkoutItems = [
            {
              productId: String(product.id),
              productName: product.name,
              unitPrice: product.price,
              quantity: quantity,
              thumbnailUrl: product.thumbnailUrl,
            },
          ];
          this.subtotal = product.price * quantity;
          this.calculateTotals();
        }
      });
  }

  private loadCartDetails(): void {
    combineLatest([
      this.store.select(selectCartItems),
      this.store.select(selectCartTotalAmount),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([items, total]) => {
        this.checkoutItems = (items || []).map((item) => ({
          productId: item.productId,
          productName: item.productName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          thumbnailUrl: item.thumbnailUrl,
        }));
        this.subtotal = total || 0;
        this.calculateTotals();
      });
  }

  private calculateTotals(): void {
    this.shippingCost = this.subtotal > 999 ? 0 : 99;
    this.grandTotal = this.subtotal + this.shippingCost;
  }

  selectAddress(addressId: string): void {
    this.selectedAddressid = addressId;
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.paymentMethods = method;
  }

  openAddNewAddressDialog(): void {
    const dialogData: DialogData = {
      title: 'Add New Address',
      fields: [
        { key: 'fullName', label: 'Full Name', type: 'text', required: true },
        {
          key: 'phone',
          label: 'Phone Number',
          type: 'text',
          required: true,
          maxLength: 10,
          validation: [Validators.pattern(/^\d{10}$/)],
        },
        {
          key: 'addressLine1',
          label: 'Street Address / Suite',
          type: 'text',
          required: true,
        },
        {
          key: 'addressLine2',
          label: 'Apartment, landmark (optional)',
          type: 'text',
        },
        { key: 'city', label: 'City', type: 'text', required: true },
        { key: 'state', label: 'State', type: 'text', required: true },
        { key: 'country', label: 'Country', type: 'text', required: true },
        {
          key: 'postalCode',
          label: 'Postal Code / PIN',
          type: 'text',
          required: true,
          maxLength: 6,
          validation: [Validators.pattern(/^\d{6}$/)],
        },
        {
          key: 'isDefault',
          label: 'Set as Default Address',
          type: 'checkbox',
        },
      ],
      submitButtonText: 'Add Address',
    };

    this.dialog
      .open(GenericDialogComponent, {
        width: '500px',
        data: dialogData,
      })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.userService
            .addAddress(result)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (newAddress: Address) => {
                this.notification.showSuccess(
                  'Address added successfully',
                  'Close',
                );
                this.loadUserAddresses();
                if (newAddress && newAddress.id) {
                  this.selectedAddressid = newAddress.id;
                }
              },
              error: (err) => {
                console.error('Error adding address:', err);
                this.notification.showError('Failed to add address', 'Close');
              },
            });
        }
      });
  }

  onPlaceOrder(): void {
    if (!this.selectedAddressid) {
      this.notification.showError('Please select a shipping address');
      return;
    }

    if (this.checkoutItems.length === 0) {
      this.notification.showError('Your order has no items to place');
      return;
    }

    this.isSubmitting = true;

    if (this.isDirectBuy && this.directProductId) {
      const payload: BuyNowRequest = {
        addressId: this.selectedAddressid,
        productId: this.directProductId,
        quantity: this.directQty ?? 1,
        paymentMethod: this.paymentMethods,
      };

      this.orderService
        .placeDirectOrder(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: CreateOrderResponse) => {
            this.isSubmitting = false;
            this.notification.showSuccess('Order placed successfully!');
            this.router.navigate(['/account/checkout-success'], {
              queryParams: { orderId: response.orderId },
            });
          },
          error: (err) => {
            this.isSubmitting = false;
            this.notification.showError(
              err?.error?.message || 'Failed to place order',
            );
          },
        });
    } else {
      const payload: CreateOrderRequest = {
        addressId: this.selectedAddressid,
        paymentMethod: this.paymentMethods,
      };

      this.orderService
        .placeCartOrder(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: CreateOrderResponse) => {
            this.isSubmitting = false;
            this.store.dispatch(CartActions.clearCart());
            this.notification.showSuccess('Order placed successfully!');
            this.router.navigate(['/account/checkout-success'], {
              queryParams: { orderId: response.orderId },
            });
          },
          error: (err) => {
            this.isSubmitting = false;
            this.notification.showError(
              err?.error?.message || 'Failed to place order',
            );
          },
        });
    }
  }

  goBack(): void {
    window.history.back();
  }
}
