import { Directive, inject, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectUserRole } from '../../core/store/auth/auth.selectors';
import { Role, normalizeRole } from '../../core/models/auth.model';

@Directive({
  selector: '[appRole]'
})
export class RoleDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private store = inject(Store);

  private requiredRole: Role | number | string | null = null;
  private currentUserRole: Role | number | string | null = null;
  private roleSubscription!: Subscription;

  @Input() set appRole(role: Role | number | string) {
    this.requiredRole = role;
    this.updateView();
  }

  ngOnInit() {
    this.roleSubscription = this.store.select(selectUserRole).subscribe(role => {
      this.currentUserRole = role;
      this.updateView();
    });
  }

  private updateView() {
    this.viewContainer.clear();

    const current = normalizeRole(this.currentUserRole);
    const required = normalizeRole(this.requiredRole);

    if (current !== null && required !== null && current === required) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  ngOnDestroy() {
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }
}

