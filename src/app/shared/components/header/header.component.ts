import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject, HostListener, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Trainer } from './../../../core/models/trainer.interface';
import { TrainerService } from '../../../core/services/trainer.service';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  trainerName: string = '';
  isLoading: boolean = false;
  hasError: boolean = false;
  currentTrainer: Trainer | null = null;
  nameDisplay: string = '';
  isTrainerCreated: boolean = false;
  isDropdownOpen: boolean = false;
  
  private storageListener: ((event: StorageEvent | Event) => void) | null = null;
  
  constructor(
    private router: Router,
    private trainerService: TrainerService,
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.storageListener = (event) => {
        this.isTrainerCreated = localStorage.getItem('isTrainerCreated') === 'true';
        if (this.isTrainerCreated) {
          this.loadTrainerData();
        }
      };
    }
  }
  
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkTrainerStatus();
      
      if (this.storageListener) {
        window.addEventListener('storage', this.storageListener);
      }
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
  }

  checkTrainerStatus(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    // Verificar el estado inicial
    this.isTrainerCreated = localStorage.getItem('isTrainerCreated') === 'true';
    
    if (this.isTrainerCreated) {
      this.loadTrainerData();
    }
  }

  loadTrainerData(): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.trainerService.getTrainer().subscribe({
      next: (trainer) => {
        this.currentTrainer = trainer;
        this.trainerName = trainer?.name?.trim().split(' ')[0] || '';
        this.nameDisplay = this.trainerName;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading trainer:', error);
        this.isLoading = false;
      }
    });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  clearData(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      sessionStorage.clear();
    }
    this.isTrainerCreated = false;
    this.trainerName = '';
    this.currentTrainer = null;
    this.isDropdownOpen = false;
    this.router.navigate(['/trainer-profile/create']);
  }
}