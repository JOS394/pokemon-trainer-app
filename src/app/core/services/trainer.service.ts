import { Injectable, signal } from '@angular/core';
import { IdentificationType, Trainer, TrainerFormModel } from '../models/trainer.interface';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Pokemon } from '../models/pokemon.interface';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  private readonly STORAGE_KEY = 'pokemon_trainer_profile';
  
  private trainerSignal = signal<Trainer | null>(null);
  
  private hasAttemptedLoad = false;

  pokemonList: Pokemon[] = [];

  private isTrainerCreatedSubject = new BehaviorSubject<boolean>(false);
  isTrainerCreated$ = this.isTrainerCreatedSubject.asObservable();
  
  
  constructor() {
    if (this.isBrowser()) {
      setTimeout(() => {
        this.loadTrainerFromStorage();
        const isCreated = localStorage.getItem('isTrainerCreated') === 'true';
        this.isTrainerCreatedSubject.next(isCreated);
      }, 0);
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  getTrainer(): Observable<Trainer | null> {
    if (!this.hasAttemptedLoad && this.isBrowser()) {
      this.loadTrainerFromStorage();
    }
    return of(this.trainerSignal());
  }

  hasTrainerProfile(): boolean {
    if (!this.hasAttemptedLoad && this.isBrowser()) {
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

  setTrainerCreated(value: boolean): void {
    if (this.isBrowser()) {
      localStorage.setItem('isTrainerCreated', value.toString());
      this.isTrainerCreatedSubject.next(value);
    }
  }

  updateTrainer(formData: TrainerFormModel): Observable<void> {
    const currentTrainer = this.trainerSignal();
    
    const mappedFormData = this.mapFormToTrainer(formData);
    
    const updatedTrainer: Trainer = {
      id: currentTrainer?.id || this.generateId(),
      name: mappedFormData.name || currentTrainer?.name || '',
      photo: mappedFormData.photo || currentTrainer?.photo || '',
      birthDate: mappedFormData.birthDate || currentTrainer?.birthDate || new Date(),
      age: mappedFormData.age || currentTrainer?.age || 0,
      hobby: mappedFormData.hobby || currentTrainer?.hobby,
      identification: mappedFormData.identification || currentTrainer?.identification || {
        type: IdentificationType.MINOR_ID,
        number: ''
      },
      team: currentTrainer?.team || [],
      createdAt: currentTrainer?.createdAt || new Date(),
      updatedAt: new Date()
    };
    
    this.saveToLocalStorage(updatedTrainer);
    this.trainerSignal.set(updatedTrainer);
    return of(void 0);
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
    
    if (this.isBrowser() && URL.createObjectURL) {
      try {
        return URL.createObjectURL(photo);
      } catch (error) {
        console.error('Error creating object URL:', error);
        return '';
      }
    }
    
    return '';
  }

  private loadTrainerFromStorage(): void {
    this.hasAttemptedLoad = true;
    
    if (!this.isBrowser()) {
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
    if (!this.isBrowser()) {
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

  private loadFromLocalStorage(): Trainer | null {
    if (!this.isBrowser()) {
      return null;
    }

    const data = localStorage.getItem(this.STORAGE_KEY);
    if (data) {
      try {
        const trainer = JSON.parse(data);

        trainer.birthDate = new Date(trainer.birthDate);
        if (trainer.createdAt) trainer.createdAt = new Date(trainer.createdAt);
        if (trainer.updatedAt) trainer.updatedAt = new Date(trainer.updatedAt);
        return trainer;
      } catch (error) {
        console.error('Error parsing trainer data:', error);
        return null;
      }
    }
    return null;
  }

  private mapFormToTrainer(formData: TrainerFormModel): Partial<Trainer> {
    const birthDate = new Date(formData.birthDate);
    const age = this.calculateAge(birthDate);
    
    return {
      name: formData.name,
      photo: this.processPhoto(formData.photo),
      birthDate: birthDate,
      age: age,
      hobby: formData.hobby,
      identification: {
        type: formData.identificationType,
        number: formData.identificationNumber
      },
      createdAt: new Date()
    };
  }

  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private saveToLocalStorage(trainer: Trainer): void {
    if (!this.isBrowser()) {
      return;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trainer));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  clearAllData(): void {
    if (this.isBrowser()) {
      localStorage.clear();
      sessionStorage.clear();
      this.trainerSignal.set(null);
      this.isTrainerCreatedSubject.next(false);
    }
  }
}