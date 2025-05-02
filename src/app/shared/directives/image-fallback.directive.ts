import { Directive, HostBinding, HostListener, Input } from '@angular/core';

/**
 * Directive to handle image loading errors with a fallback image
 * Applied to img elements to provide a default image when the primary source fails to load
 */
@Directive({
  selector: 'img[appImageFallback]',
  standalone: true
})
export class ImageFallbackDirective {
  @Input() appImageFallback = 'assets/images/default-pokemon.png';
  @HostBinding('src') @Input() src = '';
  
  /**
   * Listen for the error event on the host element (img)
   * When an error occurs, replace the src with the fallback image
   */
  @HostListener('error')
  onError(): void {
    this.src = this.appImageFallback;
  }
}