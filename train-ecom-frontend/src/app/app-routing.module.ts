import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './shared/layouts/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { customerGuard } from './core/guards/customer.guard';
import { publicGuard } from './core/guards/public.guard';
import { guestOrCustomerGuard } from './core/guards/guest-or-customer.guard';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        canActivate: [guestOrCustomerGuard],
        loadChildren: () =>
          import('./features/home/home.module').then((m) => m.HomeModule),
      },

      {
        path: 'account',
        canActivate: [authGuard],
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'profile' },
          {
            path: 'cart',
            canActivate: [customerGuard],
            loadChildren: () =>
              import('./features/cart/cart.module').then((m) => m.CartModule),
          },
          {
            path: 'orders',
            canActivate: [customerGuard],
            children: [
              { path: '', pathMatch: 'full', redirectTo: 'history' },
              {
                path: '',
                loadChildren: () =>
                  import('./features/orders/orders.module').then((m) => m.OrdersModule),
              },
            ],
          },
          {
            path: '',
            loadChildren: () =>
              import('./features/users/users.module').then((m) => m.UsersModule),
          },
        ],
      },

      {
        path: 'products',
        canActivate: [guestOrCustomerGuard],
        loadChildren: () =>
          import('./features/products/products.module').then(
            (m) => m.ProductsModule,
          ),
      },

      {
        path: 'cart',
        canActivate: [guestOrCustomerGuard],
        loadChildren: () =>
          import('./features/cart/cart.module').then((m) => m.CartModule),
      },
      {
        path: 'checkout',
        canActivate: [guestOrCustomerGuard],
        loadChildren: () =>
          import('./features/checkout/checkout.module').then((m) => m.CheckoutModule),
      },
      {
        path: 'orders',
        children: [
          { path: '', redirectTo: 'history', pathMatch: 'full' },
          {
            path: '',
            loadChildren: () =>
              import('./features/orders/orders.module').then((m) => m.OrdersModule),
          }
        ]
      },

      {
        path: 'admin',
        canActivate: [authGuard, adminGuard],
        children: [
          {
            path: 'dashboard',
            loadChildren: () =>
              import('./features/dashboard/dashboard.module').then(
                (m) => m.DashboardModule,
              ),
          },
          {
            path: 'products',
            children: [
              { path: '', redirectTo: 'manage', pathMatch: 'full' },
              {
                path: '',
                loadChildren: () =>
                  import('./features/products/products.module').then(
                    (m) => m.ProductsModule,
                  ),
              }
            ]
          },
          {
            path: 'brands',
            loadChildren: () =>
              import('./features/brand/brand.module').then(
                (m) => m.BrandModule,
              ),
          },
          {
            path: 'categories',
            loadChildren: () =>
              import('./features/category/category.module').then(
                (m) => m.CategoryModule,
              ),
          },
          {
            path: 'profile',
            loadChildren: () =>
              import('./features/users/users.module').then((m) => m.UsersModule),
          },
          {
            path: 'users',
            children: [
              { path: '', redirectTo: 'manage', pathMatch: 'full' },
              {
                path: '',
                loadChildren: () =>
                  import('./features/users/users.module').then((m) => m.UsersModule),
              }
            ]
          },
          {
            path: 'orders',
            loadChildren: () =>
              import('./features/orders/orders.module').then((m) => m.OrdersModule),
          },
          {
            path: 'reports',
            loadChildren: () =>
              import('./features/reports/reports.module').then(
                (m) => m.ReportsModule
              ),
          },
        ],
      },
      {
        path: '404',
        component: NotFoundComponent
      }
    ],
  },
  {
    path: '',
    component: AuthLayoutComponent,
    canActivate: [publicGuard],
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
