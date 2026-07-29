import { Directive, inject, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/internal/Subscription';
import { selectUserRole } from '../../core/store/auth/auth.selectors';

@Directive({
  selector: '[appRole]'
})
export class RoleDirective {

  private templateRef = inject(TemplateRef<unknown>);
  private viewContainer = inject(ViewContainerRef);
  private store = inject(Store);

  private requiredRole: string = '';
  private currentUserRole: string | null = null;
  private roleSubscription!: Subscription;

  constructor() { }

  @Input() set appRole(role: string) {
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

    if (this.currentUserRole && this.currentUserRole === this.requiredRole) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  ngOnDestroy() {
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }

}
