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

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent
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
