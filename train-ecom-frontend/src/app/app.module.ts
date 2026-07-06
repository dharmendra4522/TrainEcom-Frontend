import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeModule } from './features/home/home.module';
import { AuthModule } from './features/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { provideHttpClient } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HomeModule,
    AuthModule,
    SharedModule
  ],
  providers: [
    provideAnimations(),
    provideHttpClient(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
