import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './components/profile/profile.component';
import { AddressComponent } from './components/address/address.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { CheckoutSuccessComponent } from './components/checkout-success/checkout-success.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { customerGuard } from '../../core/guards/customer.guard';
import { authGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'profile', canActivate: [authGuard], component: ProfileComponent },
  { path: 'address', canActivate: [customerGuard], component: AddressComponent },
  { path: 'wishlist', canActivate: [customerGuard], component: WishlistComponent },
  { path: 'cart', canActivate: [customerGuard], component: CartComponent },
  { path: 'checkout', canActivate: [customerGuard], component: CheckoutComponent },
  { path: 'checkout-success', canActivate: [customerGuard], component: CheckoutSuccessComponent },
  { path: 'orders', canActivate: [customerGuard], component: OrderHistoryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
