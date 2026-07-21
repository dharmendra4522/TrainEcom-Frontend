import { Component, Input, ViewChild, inject } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';

export interface SidePanelItem {
  id: string | number;
  name: string;
  price: number;
  image?: string;
  quantity?: number;
}

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.css',
})
export class SidePanelComponent {
  private router = inject(Router);

  @Input() type: 'WishList' | 'Cart' = 'WishList';
  @Input() items: SidePanelItem[] = [];

  @ViewChild('drawer') drawer!: MatDrawer;

  open() {
    this.drawer.open();
  }

  close() {
    this.drawer.close();
  }

  get title(): string {
    return this.type === 'WishList' ? 'My Wishlist' : 'Shopping Cart';
  }

  get icon(): string {
    return this.type === 'WishList' ? 'favorite' : 'shopping_cart';
  }

  get getTotalPrice(): number {
    return this.items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  }

  navigateToShopping(): void {
    this.close();
    this.router.navigate(['/']);
  }
}
