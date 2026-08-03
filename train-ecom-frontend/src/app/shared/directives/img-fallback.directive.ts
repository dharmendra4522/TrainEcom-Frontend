import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appImgFallback]'
})
export class ImgFallbackDirective {

  constructor(private el: ElementRef<HTMLImageElement>) { }

  @HostListener('error')
  onError() {
    const element = this.el.nativeElement;
    element.src = 'assets/placeholder.jpg';
  }

}
