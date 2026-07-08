import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
// import { authGuard } from './core/guards/auth.guard'; // Ise future Checkout ke liye import karke rakhein

const routes: Routes = [
  // 1. Default Route (Empty path par aaye toh Home par bhejo)
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // 2. Public Features (Koi bhi bina login kiye dekh sakta hai)
  {
    path: 'home', // 💡 Fix: Ise '' ki jagah 'home' naam diya
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  
  // { path: 'cart', loadChildren: () => import('./features/cart/cart.module').then(m => m.CartModule) },

  // { path: 'checkout', canActivate: [authGuard], loadChildren: () => import('./features/checkout/checkout.module').then(m => m.CheckoutModule) },

  { path: 'login', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },

  { path: '**', component: NotFoundComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }