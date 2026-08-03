import { Component, Input } from '@angular/core';
import { BreadcrumbItem } from '../../../core/models/table.model';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
