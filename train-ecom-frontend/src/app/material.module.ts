import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
@NgModule({
	imports: [
		MatButtonModule,
		MatBadgeModule,
		MatInputModule,
		MatFormFieldModule,
		MatIconModule,
		MatMenuModule,
		MatToolbarModule,
		MatCardModule,
		MatDividerModule,
		MatSidenavModule,
		MatSidenav,
		MatListModule
	],
	exports: [
		MatButtonModule,
		MatBadgeModule,
		MatInputModule,
		MatFormFieldModule,
		MatIconModule,
		MatMenuModule,
		MatToolbarModule,
		MatCardModule,
		MatDividerModule,
		MatSidenavModule,
		MatSidenav,
		MatListModule
	]
})
export class MaterialModule { }
