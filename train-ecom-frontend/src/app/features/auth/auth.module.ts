import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { MaterialModule } from '../../material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from "../../shared/shared.module";
import { AuthRoutingModule } from './auth-routing.module';

import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from '../../core/store/auth/auth.effects';
import { VendorRegisterComponent } from './vendor-register/vendor-register.component';
import { PersonalDetailsComponent } from './vendor-register/components/personal-details/personal-details.component';
import { BusinessDetailsComponent } from './vendor-register/components/business-details/business-details.component';
import { AddressDetailsComponent } from './vendor-register/components/address-details/address-details.component';
import { TaxBankDetailsComponent } from './vendor-register/components/tax-bank-details/tax-bank-details.component';
import { DocumentsDetailsComponent } from './vendor-register/components/documents-details/documents-details.component';
@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    VendorRegisterComponent,
    PersonalDetailsComponent,
    BusinessDetailsComponent,
    AddressDetailsComponent,
    TaxBankDetailsComponent,
    DocumentsDetailsComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    AuthRoutingModule,
    EffectsModule.forFeature([AuthEffects])
]
})
export class AuthModule { }
