import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appRole]'
})
export class RoleDirective {

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) { }

  @Input() set appRole(role: string){
    const currentUserRole = 'customer'; // hardcoded current

    if(currentUserRole === role){
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else{
      this.viewContainer.clear();
    }
  }
}
