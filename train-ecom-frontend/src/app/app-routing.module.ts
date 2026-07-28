import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './shared/layouts/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { publicGuard } from './core/guards/public.guard';

const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadChildren: () =>
          import('./features/home/home.module').then((m) => m.HomeModule),
      },

      {
        path: 'account',
        canActivate: [authGuard],
        loadChildren: () =>
          import('./features/users/users.module').then((m) => m.UsersModule),
      },

      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/products.module').then(
            (m) => m.ProductsModule,
          ),
      },

      {
        path: 'checkout',
        redirectTo: 'account/checkout',
        pathMatch: 'full',
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