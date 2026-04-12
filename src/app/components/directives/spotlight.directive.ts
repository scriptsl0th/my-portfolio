import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({ selector: '[spotlight]', standalone: true })
export class SpotlightDirective {
  constructor(private el: ElementRef) {}

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.el.nativeElement.style.setProperty('--mx', `${x}px`);
    this.el.nativeElement.style.setProperty('--my', `${y}px`);
  }
}
