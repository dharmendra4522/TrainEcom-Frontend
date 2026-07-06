import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';


@NgModule({
	exports: [
		MatButtonModule,
		MatInputModule,
		MatFormFieldModule,
		MatIconModule,
		MatMenuModule,
		MatToolbarModule,
        MatCardModule
	]
})
export class MaterialModule { }
