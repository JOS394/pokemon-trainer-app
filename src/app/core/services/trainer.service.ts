import { Injectable, signal, inject } from '@angular/core';
import { Trainer, TrainerFormModel } from '../models/trainer.interface';
import { Observable, of } from 'rxjs';
import { Pokemon } from '../models/pokemon.interface';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  private readonly STORAGE_KEY = 'pokemon_trainer_profile';
  
  private trainerSignal = signal<Trainer | null>(null);
  
  private hasAttemptedLoad = false;

  pokemonList: Pokemon[] = [];
  
  constructor() {
    queueMicrotask(() => {
      this.loadTrainerFromStorage();
    });
  }

  getTrainer(): Observable<Trainer | null> {
    if (!this.hasAttemptedLoad && this.isLocalStorageAvailable()) {
      this.loadTrainerFromStorage();
    }
    return of(this.trainerSignal());
  }

  hasTrainerProfile(): boolean {
    if (!this.hasAttemptedLoad && this.isLocalStorageAvailable()) {
      this.loadTrainerFromStorage();
    }
    return !!this.trainerSignal();
  }

  saveTrainer(formData: TrainerFormModel): Observable<Trainer> {
    const trainer: Trainer = {
      id: this.trainerSignal()?.id || this.generateId(),
      name: formData.name,
      photo: this.processPhoto(formData.photo),
      birthDate: formData.birthDate,
      hobby: formData.hobby,
      identification: {
        type: formData.identificationType,
        number: formData.identificationNumber
      },
      age: formData.birthDate ? new Date().getFullYear() - new Date(formData.birthDate).getFullYear() : 18,
      team: this.trainerSignal()?.team || [],
      updatedAt: new Date()
    };

    if (!this.trainerSignal()) {
      trainer.createdAt = new Date();
    }

    this.trainerSignal.set(trainer);
    this.saveTrainerToStorage(trainer);

    return of(trainer);
  }

  updateTeam(pokemonIds: number[]): Observable<Trainer | null> {
    const currentTrainer = this.trainerSignal();
    
    if (!currentTrainer) {
      return of(null);
    }

    const updatedTrainer: Trainer = {
      ...currentTrainer,
      team: pokemonIds,
      updatedAt: new Date()
    };

    this.trainerSignal.set(updatedTrainer);
    this.saveTrainerToStorage(updatedTrainer);

    return of(updatedTrainer);
  }

  private processPhoto(photo: string | File | null): string {
    if (!photo) return '';
    
    if (typeof photo === 'string') {
      return photo;
    }
    
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      try {
        return URL.createObjectURL(photo);
      } catch (error) {
        console.error('Error creating object URL:', error);
        return '';
      }
    }
    
    return '';
  }

  private isLocalStorageAvailable(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }

    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  }

  private loadTrainerFromStorage(): void {
    this.hasAttemptedLoad = true;
    
    if (!this.isLocalStorageAvailable()) {
      return;
    }
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const trainer = JSON.parse(stored) as Trainer;
        trainer.birthDate = new Date(trainer.birthDate);
        if (trainer.createdAt) trainer.createdAt = new Date(trainer.createdAt);
        if (trainer.updatedAt) trainer.updatedAt = new Date(trainer.updatedAt);
        
        this.trainerSignal.set(trainer);
      }
    } catch (error) {
      console.error('Error loading trainer from storage:', error);
    }
  }

  private saveTrainerToStorage(trainer: Trainer): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trainer));
    } catch (error) {
      console.error('Error saving trainer to storage:', error);
    }
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, 
            v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  savePokemonSelection(pokemonIds: number[]): Observable<Trainer | null> {
    const currentTrainer = this.trainerSignal();
    
    if (!currentTrainer) {
      return of(null);
    }

    const updatedTrainer: Trainer = {
      ...currentTrainer,
      team: pokemonIds,
      updatedAt: new Date()
    };

    this.trainerSignal.set(updatedTrainer);
    this.saveTrainerToStorage(updatedTrainer);

    return of(updatedTrainer);
  }

  getPokemonList(): Observable<Pokemon[]> {
    return of(this.pokemonList);
  }
}