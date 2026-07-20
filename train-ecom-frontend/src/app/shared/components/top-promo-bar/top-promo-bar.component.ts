import { Component } from '@angular/core';

@Component({
  selector: 'app-top-promo-bar',
  templateUrl: './top-promo-bar.component.html',
  styleUrl: './top-promo-bar.component.css',
})
export class TopPromoBarComponent {
  isVisible: boolean = true;

  constructor() {
    this.closePromo();
  }
  closePromo(): void {
    setTimeout(() => {
      this.isVisible = false;
    }, 1000);
  }
}
