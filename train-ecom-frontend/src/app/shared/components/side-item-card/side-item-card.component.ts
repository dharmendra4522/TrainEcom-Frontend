import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WishListItem } from '../../../core/models/wishList.model';

@Component({
  selector: 'app-side-item-card',
  templateUrl: './side-item-card.component.html',
  styleUrl: './side-item-card.component.css'
})
export class SideItemCardComponent {
  @Input() item!: WishListItem;
  @Input() mode: 'wishlist' | 'cart' = 'wishlist';

  @Output() remove = new EventEmitter<string>();
  @Output() quantityChange = new EventEmitter<{ id: string, action: 'add' | 'subtract' }>();
  @Output() moveToCart = new EventEmitter<WishListItem>();


  onRemove() {
    this.remove.emit(this.item.id);
  }

  onIncreaseQuantity(): void {
    this.quantityChange.emit({ id: this.item.id, action: 'add' });
  }

  onDecreaseQuantity(): void {
    if (this.item.quantity && this.item.quantity > 1) {
      this.quantityChange.emit({ id: this.item.id, action: 'subtract' });
    } else {
      this.onRemove();
    }
  }

  onMoveToCart(): void {
    this.moveToCart.emit(this.item);
  }

}
