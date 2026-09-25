import { Directive, inject, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { selectUserRole } from '../../core/store/auth/auth.selectors';
import { Role } from '../../core/models/auth.model';
import { normalizeRole } from '../../core/utils/role.utils';

@Directive({
  selector: '[appRole]'
})
export class RoleDirective implements OnInit, OnDestroy {
  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private store = inject(Store);

  private requiredRole: Array<Role | number | string> = [];
  private currentUserRole: Role | number | string | null = null;
  private roleSubscription!: Subscription;

  @Input() set appRole(role: Role | number | string | Array<Role | number | string>) {
    this.requiredRole = Array.isArray(role) ? role : [role];
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
    const requiredRoles = this.requiredRole.map((role) => normalizeRole(role));

    if (current !== null && requiredRoles.includes(current)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  ngOnDestroy() {
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }
}

