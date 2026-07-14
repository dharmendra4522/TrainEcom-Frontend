import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { MenuItem } from '../../models/menu-item.model';



@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  @Input() menuItems: MenuItem[] = [];
  @Input() title: string = 'Menu';
  @Input() sidebarType: string = 'admin';
}
