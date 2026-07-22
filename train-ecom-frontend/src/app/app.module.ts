import { isDevMode, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { SharedModule } from './shared/shared.module';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { authReducer } from './core/store/auth/auth.reducer';
import { AuthEffects } from './core/store/auth/auth.effects';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { userReducer } from './core/store/user/user.reducer';
import { UserEffects } from './core/store/user/user.effects';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { ProductEffects } from './core/store/product/product.effects';
import { productReducer } from './core/store/product/product.reducer';
import { brandReducer } from './core/store/brand/brand.reducer';
import { BrandEffects } from './core/store/brand/brand.effects';
import { categoryReducer } from './core/store/category/category.reducer';
import { CategoryEffects } from './core/store/category/category.effects';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,

    StoreModule.forRoot({
      auth: authReducer,
      user: userReducer,
      product: productReducer,
      brand: brandReducer,
      category: categoryReducer
      
    }),
    EffectsModule.forRoot([AuthEffects, UserEffects, ProductEffects, BrandEffects, CategoryEffects]),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() })

  ],
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }