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
import { switchMap, takeUntil, of, combineLatest, Observable } from 'rxjs';
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
import {
  SelectionDialogComponent,
  SelectionDialogData,
} from '../../../../shared/components/selection-dialog/selection-dialog.component';

type AddressFormResult = Omit<Address, 'id' | 'country' | 'isDefault'>;

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
  selectedAddressid: string | null = null;

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
      (address) => address.id === this.selectedAddressid,
    );
  }

  // Open the saved-address selection dialog.
  openChangeAddressDialog(): void {
    const dialogData: SelectionDialogData<Address> = {
      title: 'Select Delivery Address',
      items: this.addresses,
      selectedId: this.selectedAddressid || '',
      displayKey: 'fullName',
      addButtonLabel: 'Add Address',
    };

    this.dialog
      .open<
        SelectionDialogComponent<Address>,
        SelectionDialogData<Address>,
        Address | 'add'
      >(SelectionDialogComponent, {
        width: '750px',
        data: dialogData,
      })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result === 'add') {
          this.openAddNewAddressDialog();
        } else if (result) {
          this.selectAddress(result.id);
        }
      });
  }

  // Load user addresses and set the default or first address as selected
  private loadUserAddresses(preferredAddressId?: string): void {
    this.userService
      .getAllAddress()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.addresses = data || [];
          const selectedAddress =
            this.addresses.find(
              (address) => address.id === preferredAddressId,
            ) ||
            this.addresses.find((address) => address.isDefault) ||
            this.addresses[0];

          this.selectedAddressid = selectedAddress?.id || null;
        },
        error: (err) => {
          console.error('Error fetching addresses:', err);
        },
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

  // Load product details for direct buy and set the checkout items and subtotal
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
          itemId: item.itemId,
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

  // Calculate shipping cost and grand total based on subtotal
  private calculateTotals(): void {
    this.shippingCost = 0;
    this.grandTotal = this.subtotal;
  }

  selectAddress(addressId: string): void {
    this.selectedAddressid = addressId;
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.paymentMethods = method;
  }

  // Open a dialog to add a new address and handle the submission to update the user's address list
  openAddNewAddressDialog(): void {
    const dialogData = this.getAddressDialogConfig();

    this.dialog
      .open(GenericDialogComponent, {
        width: '550px',
        data: dialogData,
      })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: AddressFormResult | undefined) => {
        if (result) {
          this.handleAddressSubmission(result);
        }
      });
  }

  private getAddressDialogConfig(): DialogData {
    return {
      title: 'Add New Address',
      fields: [
        {
          key: 'fullName',
          label: 'Full Name',
          type: 'text',
          validation: [
            Validators.required,
            Validators.pattern(/^[a-zA-Z\s]+$/),
          ],
        },
        {
          key: 'phone',
          label: 'Phone Number',
          type: 'text',
          maxLength: 10,
          validation: [Validators.required, Validators.pattern(/^\d{10}$/)],
        },
        {
          key: 'addressLine1',
          label: 'Address Line 1',
          type: 'text',
          validation: [Validators.required],
        },
        {
          key: 'addressLine2',
          label: 'Address Line 2 (Optional)',
          type: 'text',
        },
        {
          key: 'city',
          label: 'City',
          type: 'text',
          validation: [Validators.required],
        },
        {
          key: 'state',
          label: 'State',
          type: 'text',
          validation: [Validators.required],
        },
        {
          key: 'postalCode',
          label: 'Postal Code',
          type: 'text',
          maxLength: 6,
          validation: [Validators.required],
        },
      ],
      submitButtonText: 'Save Address',
    };
  }

  private mapFormResultToAddress(result: AddressFormResult): Address {
    return {
      ...result,
      id: '',
      phone: String(result.phone),
      postalCode: String(result.postalCode),
      country: 'India',
      isDefault: false,
    };
  }

  private handleAddressSubmission(result: AddressFormResult): void {
    const address: Address = this.mapFormResultToAddress(result);

    this.userService
      .addAddress(address)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newAddress: Address) => {
          this.notification.showSuccess('Address added successfully', 'Close');
          this.loadUserAddresses(newAddress.id);
        },
        error: (err) => {
          console.error('Error adding address:', err);
          this.notification.showError('Failed to add address', 'Close');
        },
      });
  }

  removeCheckoutItem(item: CheckoutItem): void {
    if (this.isDirectBuy) {
      this.checkoutItems = this.checkoutItems.filter(
        (checkoutItem) => checkoutItem.productId !== item.productId,
      );
      this.subtotal = this.checkoutItems.reduce(
        (total, checkoutItem) =>
          total + checkoutItem.unitPrice * checkoutItem.quantity,
        0,
      );
      this.calculateTotals();
      return;
    }

    this.store.dispatch(
      CartActions.deleteCartItem({ itemId: item.itemId || item.productId }),
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
      amount: this.grandTotal,
    };

    this.orderService
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
              'Payment simulation or order placement failed',
          ),
      });
  }

  // Handle Cash on Delivery (COD) Order Placement
  private handleCashOnDeliveryOrder(): void {
    this.executeOrderPlacement()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: CreateOrderResponse) => this.onOrderSuccess(response),
        error: (err) =>
          this.onOrderError(err?.error?.message || 'Order placement failed'),
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
      return this.orderService.placeDirectOrder(buyNowPayload);
    } else {
      const cartOrderPayload: CreateOrderRequest = {
        addressId: this.selectedAddressid as string,
        paymentMethod: this.paymentMethods,
        transactionId: transactionId,
      };
      return this.orderService.placeCartOrder(cartOrderPayload);
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
      replaceUrl: true,
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
