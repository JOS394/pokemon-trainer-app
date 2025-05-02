import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Trainer, TrainerFormModel } from '../../core/models/trainer.interface';
import { TrainerService } from '../../core/services/trainer.service';
import { PokemonStore } from '../../store/pokemon/pokemon.store';
import { finalize } from 'rxjs';

/**
 * Store for managing Trainer profile state using Angular Signals
 */
@Injectable({
  providedIn: 'root'
})
export class TrainerStore {
  private trainerService = inject(TrainerService);
  private pokemonStore = inject(PokemonStore);
  private router = inject(Router);
  
  // State signals
  private trainer = signal<Trainer | null>(null);
  private loading = signal<boolean>(false);
  
  // Computed values
  public readonly currentTrainer: Signal<Trainer | null> = computed(() => this.trainer());
  public readonly isLoading: Signal<boolean> = computed(() => this.loading());
  public readonly hasProfile: Signal<boolean> = computed(() => !!this.trainer());
  
  constructor() {
    this.loadTrainerProfile();
  }
  
  /**
   * Loads the trainer profile from the service
   */
  loadTrainerProfile(): void {
    this.loading.set(true);
    
    this.trainerService.getTrainer()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (trainer) => {
          this.trainer.set(trainer);
          
          // If trainer has a team, load it in the pokemon store
          if (trainer && trainer.team?.length) {
            this.pokemonStore.loadTeamFromIds(trainer.team);
          }
        },
        error: (error) => {
          console.error('Failed to load trainer profile:', error);
        }
      });
  }
  
  /**
   * Creates or updates the trainer profile
   * @param formData - The trainer form data
   */
  saveTrainerProfile(formData: TrainerFormModel): void {
    this.loading.set(true);
    
    this.trainerService.saveTrainer(formData)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (savedTrainer) => {
          this.trainer.set(savedTrainer);
          this.router.navigate(['/pokemon-selection']);
        },
        error: (error) => {
          console.error('Failed to save trainer profile:', error);
          // Could show an error notification here
        }
      });
  }
  
  /**
   * Updates the trainer's Pokémon team
   */
  updateTeam(): void {
    if (!this.hasProfile()) {
      console.warn('Cannot update team without a trainer profile');
      return;
    }
    
    const teamIds = this.pokemonStore.getTeamIds();
    this.loading.set(true);
    
    this.trainerService.updateTeam(teamIds)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (updatedTrainer) => {
          this.trainer.set(updatedTrainer);
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Failed to update trainer team:', error);
          // Could show an error notification here
        }
      });
  }
}