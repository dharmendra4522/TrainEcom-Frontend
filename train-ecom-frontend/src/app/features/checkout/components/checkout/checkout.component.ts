import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CheckoutService } from '../../../../core/services/checkout.service';
import { NotificationService } from '../../../../core/services/notification.service';
import {
  BuyNowRequest,
  CreateOrderRequest,
  CreateOrderResponse,
  PaymentMethod,
  CheckoutItem,
  ValidateCheckoutItem,
  ValidateCheckoutResponse,
} from '../../../../core/models/checkout.model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { Subject } from 'rxjs/internal/Subject';
import { Address } from '../../../../core/models/user.model';
import { switchMap, takeUntil, of, combineLatest, Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { ConfirmDialogServiceService } from '../../../../core/services/confirm-dialog.service';
import * as ProductActions from '../../../../core/store/product/product.action';
import { selectProductById } from '../../../../core/store/product/product.selectors';
import {
  selectCartItems,
  selectCartTotalAmount,
} from '../../../../core/store/cart/cart.selectors';
import * as CartActions from '../../../../core/store/cart/cart.actions';
import { AddressFormResult } from '../checkout-address/checkout-address.component';


@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private checkoutService = inject(CheckoutService);
  private notification = inject(NotificationService);
  private confirmDialog = inject(ConfirmDialogServiceService);
  private destroy$ = new Subject<void>();
  private store = inject(Store);

  isDirectBuy: boolean = false;
  directProductId: number | null = null;
  directQty: number | null = null;

  addresses: Address[] = [];
  selectedAddressid: string | number | null = null;

  checkoutItems: CheckoutItem[] = [];
  subtotal: number = 0;
  shippingCost: number = 0;
  grandTotal: number = 0;

  paymentMethods: PaymentMethod = PaymentMethod.CashOnDelivery;
  isSubmitting: boolean = false;
  isProcessing: boolean = false;

  PaymentMethod = PaymentMethod;

  ngOnInit(): void {
    this.loadUserAddresses();
    this.parseRouteParamsAndSetContext();
    this.validateRouteParams();
  }

  // validate routes
  private validateRouteParams(): void {
    setTimeout(() => {
      if (
        !this.isDirectBuy &&
        (!this.checkoutItems || this.checkoutItems.length === 0)
      ) {
        this.notification.showError('No items in cart to checkout.');
        this.router.navigate(['/cart'], { replaceUrl: true });
      }
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Currently selected delivery address.
  get selectedAddress(): Address | undefined {
    return this.addresses.find(
      (address) => address.id === this.selectedAddressid
    );
  }

  // Load user addresses and set the default or first address as selected
  private loadUserAddresses(preferredAddressId?: string | number): void {
    this.userService
      .getAllAddress()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.addresses = data || [];
          const selectedAddress =
            this.addresses.find(
              (address) => String(address.id) === String(preferredAddressId)
            ) ||
            this.addresses.find((address) => address.isDefault) ||
            this.addresses[0];

          this.selectedAddressid = selectedAddress?.id ?? null;
        },
        error: (err) => {
          console.error('Error fetching addresses:', err);
        }
      });
  }

  // Parse route parameters to determine if it's a direct buy or cart checkout and load the appropriate details
  private parseRouteParamsAndSetContext(): void {
    this.route.queryParamMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const prodId = params.get('productId');
        const qtyParam = params.get('quantity');
        const qty = qtyParam ? +qtyParam : 1;

        if (prodId) {
          const productId = Number.parseInt(prodId, 10);
          if (!Number.isSafeInteger(productId)) {
            this.notification.showError('Product information is not available.');
            return;
          }
          this.isDirectBuy = true;
          this.directProductId = productId;
          this.directQty = qty;
          this.loadDirectProductDetails(productId, qty);
        } else {
          this.isDirectBuy = false;
          this.loadCartDetails();
        }
      });
  }

  // Load product details for direct buy and set the checkout items and subtotal
  private loadDirectProductDetails(productId: number, quantity: number): void {
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
    this.validateCartInventory();
    combineLatest([
      this.store.select(selectCartItems),
      this.store.select(selectCartTotalAmount),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([items, total]) => {
        this.checkoutItems = (items || []).map((item) => ({
          itemId: item.itemId,
          productId: item.productId,
          productName: item.productName,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          thumbnailUrl: item.thumbnailUrl
        }));
        this.subtotal = total || 0;
        this.calculateTotals();

        if (!this.isDirectBuy && (!items || items.length === 0)) {
          this.notification.showError('No items in cart to checkout.');
          this.router.navigate(['/cart'], { replaceUrl: true });
        }
      });
  }

  // Calculate shipping cost and grand total based on subtotal
  private calculateTotals(): void {
    this.shippingCost = 0;
    this.grandTotal = this.subtotal;
  }

  selectAddress(addressId: string | number): void {
    this.selectedAddressid = addressId;
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.paymentMethods = method;
  }

  handleAddressSubmission(formResult: AddressFormResult): void {
    const addressPayload: Address = {
      ...formResult,
      id: 0,
      phone: String(formResult.phone),
      postalCode: String(formResult.postalCode),
      country: 'India',
      isDefault: false
    };

    this.userService
      .addAddress(addressPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newAddress: Address) => {
          this.notification.showSuccess('Address added successfully', 'Close');
          this.loadUserAddresses(String(newAddress.id));
        },
        error: (err) => {
          console.error('Error adding address:', err);
          this.notification.showError('Failed to add address', 'Close');
        },
      });
  }

  // Remove a checkout item after user confirmation and ensure at least one item remains in checkout
  removeCheckoutItem(item: CheckoutItem): void {
    this.confirmDialog
      .confirm(
        `Are you sure you want to remove "${item.productName || 'this item'}" from checkout?`,
        'Remove',
        'Cancel'
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        if (this.checkoutItems.length <= 1) {
          this.notification.showWarning('You must keep at least one product in checkout.');
          return;
        }

        this.performCheckoutItemRemoval(item);
      });
  }

  // Perform the actual removal of a checkout item, either from direct buy or from the cart
  private performCheckoutItemRemoval(item: CheckoutItem): void {
    if (this.isDirectBuy) {
      this.checkoutItems = this.checkoutItems.filter(
        (checkoutItem) => checkoutItem.productId !== item.productId
      );
      this.subtotal = this.checkoutItems.reduce(
        (total, checkoutItem) =>
          total + checkoutItem.unitPrice * checkoutItem.quantity,
        0
      );
      this.calculateTotals();
      return;
    }

    this.store.dispatch(
      CartActions.deleteCartItem({ itemId: String(item.itemId ?? item.productId) })
    );
  }

  // validate and place the order based on the selected payment method (COD or Online)
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
    this.isProcessing = true;

    if (
      this.paymentMethods === PaymentMethod.UPI ||
      this.paymentMethods === PaymentMethod.Card
    ) {
      this.handleOnlinePaymentOrder();
    } else {
      this.handleCashOnDeliveryOrder();
    }
  }

  // Handle Online Payment Simulation and Order Placement
  private handleOnlinePaymentOrder(): void {
    const simulationPayload = {
      paymentMethod: this.paymentMethods,
      amount: this.grandTotal
    };

    this.checkoutService
      .simulateOnlinePayment(simulationPayload)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((simResponse) => {
          const transactionId = simResponse.transactionId;
          return this.executeOrderPlacement(transactionId);
        }),
      )
      .subscribe({
        next: (response: CreateOrderResponse) => this.onOrderSuccess(response),
        error: (err) =>
          this.onOrderError(
            err?.error?.message ||
            'Payment simulation or order placement failed'
          )
      });
  }

  // Handle Cash on Delivery (COD) Order Placement
  private handleCashOnDeliveryOrder(): void {
    this.executeOrderPlacement()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CreateOrderResponse) => this.onOrderSuccess(response),
        error: (err) =>
          this.onOrderError(err?.error?.message || 'Order placement failed')
      });
  }

  // Common Order Execution Observable (Direct Buy vs Cart Checkout)
  private executeOrderPlacement(
    transactionId?: string,
  ): Observable<CreateOrderResponse> {
    if (this.isDirectBuy && this.directProductId) {
      const buyNowPayload: BuyNowRequest = {
        addressId: this.selectedAddressid as string,
        productId: this.directProductId,
        quantity: this.directQty ?? 1,
        paymentMethod: this.paymentMethods,
        transactionId: transactionId,
      };
      return this.checkoutService.placeDirectOrder(buyNowPayload);
    } else {
      const cartOrderPayload: CreateOrderRequest = {
        addressId: this.selectedAddressid as string,
        paymentMethod: this.paymentMethods,
        transactionId: transactionId
      };
      return this.checkoutService.placeCartOrder(cartOrderPayload);
    }
  }


  // Update the quantity of a checkout item and recalculate totals
  updateQuantity(item: CheckoutItem, newQuantity: number): void {
    if (newQuantity < 1) {
      this.notification.showWarning('Quantity must be at least 1');
      return;
    }
    if (this.isDirectBuy) {
      this.directQty = newQuantity;
      item.quantity = newQuantity;
      this.subtotal = this.checkoutItems.reduce(
        (sum, i) => sum + i.unitPrice * i.quantity,
        0
      );
      this.calculateTotals();
    } else {
      this.store.dispatch(
        CartActions.updateCartItem({
          itemId: String(item.itemId ?? item.productId),
          quantity: newQuantity
        })
      );
    }
  }

  // Success Handler
  private onOrderSuccess(response: CreateOrderResponse): void {
    this.isSubmitting = false;
    this.isProcessing = false;
    if (!this.isDirectBuy) {
      this.store.dispatch(CartActions.clearCart());
    }
    this.notification.showSuccess('Order placed successfully!');
    this.router.navigate(['/checkout/success'], {
      queryParams: { orderId: response.orderId },
      replaceUrl: true
    });
  }

  handleAddressUpdate(event: { id: string | number; address: AddressFormResult }): void {
    const addressId = Number(event.id);
    const addressPayload: Address = {
      ...event.address,
      id: addressId,
      phone: String(event.address.phone),
      postalCode: String(event.address.postalCode),
      country: 'India',
      isDefault: false
    };
    this.userService
      .updateAddress(addressId, addressPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.notification.showSuccess('Address updated successfully', 'Close');
          this.loadUserAddresses(addressId);
        },
        error: (err) => {
          console.error('Error updating address:', err);
          this.notification.showError('Failed to update address', 'Close');
        },
      });
  }

  handleAddressDelete(addressId: string | number): void {
    const numAddressId = Number(addressId);
    const addressToDelete = this.addresses.find(a => a.id === numAddressId || a.id === addressId);
    if (!addressToDelete) return;

    this.confirmDialog
      .confirm(
        `Are you sure you want to delete the address for "${addressToDelete.fullName}"?`,
        'Delete',
        'Cancel'
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.userService
          .deleteAddress(numAddressId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.notification.showSuccess('Address deleted successfully', 'Close');
              // If the deleted address was currently selected, reset it
              if (this.selectedAddressid === addressId) {
                this.selectedAddressid = null;
              }
              this.loadUserAddresses(this.selectedAddressid || undefined);
            },
            error: (err) => {
              console.error('Error deleting address:', err);
              this.notification.showError('Failed to delete address', 'Close');
            },
          });
      });
  }

  // validate the checkout before placing the order
  validateCartInventory(): void {
    this.checkoutService
      .validateCheckout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ValidateCheckoutResponse) => {
          if (response && response.isValid === false) {
            const invalidItem: ValidateCheckoutItem | undefined = response.items?.find(
              (item: ValidateCheckoutItem) =>
                !item.isAvailable || (item.message !== null && item.message !== undefined && item.message.trim() !== '')
            );

            const errorMessage: string =
              invalidItem?.message ||
              (invalidItem
                ? `${invalidItem.productName} is currently unavailable or exceeds available stock (${invalidItem.availableStock}).`
                : 'Some items in your cart are out of stock or quantity exceeds availability.');

            this.notification.showError(errorMessage);
            this.router.navigate(['/cart'], { replaceUrl: true });
          }
        },
        error: (err: unknown) => {
          const errorObj = err as { error?: { message?: string } };
          const errMsg =
            errorObj?.error?.message ||
            'Inventory validation failed. Please check your cart.';
          this.notification.showError(errMsg);
          this.router.navigate(['/cart'], { replaceUrl: true });
        },
      });
  }


  // Error Handler
  private onOrderError(errorMessage: string): void {
    this.isSubmitting = false;
    this.isProcessing = false;
    this.notification.showError(errorMessage);
  }

  checkoutBreadcrumbs = [
    { label: 'Home', url: '/' },
    { label: 'Cart', url: '/cart' },
    { label: 'Checkout' }
  ];

  goBack(): void {
    window.history.back();
  }
}
