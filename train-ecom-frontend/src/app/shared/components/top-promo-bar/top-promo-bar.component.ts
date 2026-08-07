import { Component } from '@angular/core';

@Component({
  selector: 'app-top-promo-bar',
  templateUrl: './top-promo-bar.component.html',
  styleUrl: './top-promo-bar.component.css',
})
export class TopPromoBarComponent {
  isVisible: boolean = true;

  constructor() {
   
  }
  closePromo(): void {
   this.isVisible = false;
  }
}
