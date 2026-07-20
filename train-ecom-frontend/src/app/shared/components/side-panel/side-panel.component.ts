import { Component, Input, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrl: './side-panel.component.css',
})
export class SidePanelComponent {
  @Input() type: 'WishList' | 'Cart' = 'WishList';
  @Input() items: any[] = [];

  @ViewChild('drawer') drawer!: MatDrawer;

  open() {
    this.drawer.open();
  }

  close() {
    this.drawer.close();
  }
}
