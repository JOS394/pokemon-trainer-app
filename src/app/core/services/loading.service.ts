import { Injectable, signal } from '@angular/core';

/**
 * Service for managing global loading state
 * Uses Angular signal for efficient reactivity
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  // Signal to track loading state
  private loadingSignal = signal(false);
  
  // Counter to track multiple concurrent requests
  private requestCount = 0;
  
  /**
   * Check if application is in loading state
   * @returns loading state signal
   */
  isLoading() {
    return this.loadingSignal.asReadonly();
  }
  
  /**
   * Show the loading indicator
   */
  show(): void {
    this.requestCount++;
    this.loadingSignal.set(true);
  }
  
  /**
   * Hide the loading indicator if all requests are complete
   */
  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.loadingSignal.set(false);
    }
  }
}