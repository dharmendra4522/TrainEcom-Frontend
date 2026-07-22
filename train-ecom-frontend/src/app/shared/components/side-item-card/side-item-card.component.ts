import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WishListItem } from '../../../core/models/wishList.model';

export interface SideItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  thumbnailUrl?: string;
  quantity?: number;
  productId?: string;
}

@Component({
  selector: 'app-side-item-card',
  templateUrl: './side-item-card.component.html',
  styleUrl: './side-item-card.component.css'
})
export class SideItemCardComponent {
  @Input() item!: SideItem;
  @Input() mode: 'cart' | 'wishlist' = 'wishlist';

  @Output() remove = new EventEmitter<string>();
  @Output() quantityChange = new EventEmitter<{ id: string, action: 'add' | 'subtract' }>();
  @Output() moveToCart = new EventEmitter<SideItem>();

  onRemove() {
    this.remove.emit(this.item.id);
  }

  onIncrement() {
    this.quantityChange.emit({ id: this.item.id, action: 'add' });
  }

  onDecrement() {
    if (this.item.quantity && this.item.quantity > 1) {
      this.quantityChange.emit({ id: this.item.id, action: 'subtract' });
    } else {
      this.onRemove();
    }
  }

  onMoveToCart() {
    this.moveToCart.emit(this.item);
  }
}
