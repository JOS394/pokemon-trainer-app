import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TrainerService } from '../../../../core/services/trainer.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { Pokemon } from '../../../../core/models/pokemon.interface';
import { Trainer } from '../../../../core/models/trainer.interface';
import { TrainerInfoComponent } from '../../components/trainer-info/trainer-info.component';
import { PokemonSearchComponent } from '../../components/pokemon-search/pokemon-search.component';
import { PokemonListComponent } from '../../components/pokemon-list/pokemon-list.component';
import { PokemonService } from '../../../../core/services/pokemon.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-team-selection',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    LoaderComponent,
    TrainerInfoComponent,
    PokemonSearchComponent,
    PokemonListComponent
  ],
  templateUrl: './team-selection.component.html',
  styleUrls: ['./team-selection.component.scss']
})
export class TeamSelectionComponent implements OnInit {
  pokemons: Pokemon[] = [];
  filteredPokemons: Pokemon[] = [];
  selectedPokemons: Pokemon[] = [];
  isLoading: boolean = false;
  maxSelection: number = 3;
  currentTrainer: Trainer | null = null;
  allPokemons: Pokemon[] = [];
  hasError: boolean = false;
  errorMessage: string = '';
  
  
  constructor(
    public trainerService: TrainerService,
    private pokemonService: PokemonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.trainerService.getTrainer().subscribe({
      next: (trainer) => {
        this.currentTrainer = trainer;
        this.loadPokemonList();
      },
      error: (error) => {
        console.error('Error loading trainer:', error);
        this.isLoading = false;
        this.router.navigate(['/profile-create']);
      }
    });
  }

  loadPokemonList(): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.pokemonService.getFirstGeneration()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (pokemons) => {
          this.pokemons = pokemons;
          this.filteredPokemons = [...this.pokemons];
          
          if (this.currentTrainer?.team && this.currentTrainer.team.length > 0) {
            this.preselectTeam();
          }
        },
        error: (error) => {
          this.hasError = true;
          this.errorMessage = 'Error al cargar la lista de Pokémon. Por favor, intenta de nuevo más tarde.';
          console.error('Error loading Pokémon list:', error);
          
          this.loadFallbackData();
        }
      });
  }

  preselectTeam(): void {
    if (!this.currentTrainer?.team) return;
    
    this.currentTrainer.team.forEach(pokemonId => {
      const pokemon = this.pokemons.find(p => p.id === pokemonId);
      if (pokemon && !this.selectedPokemons.some(p => p.id === pokemon.id)) {
        this.selectedPokemons.push(pokemon);
      }
    });
  }

  loadFallbackData(): void {
    this.pokemons = [
    ];
    this.filteredPokemons = [...this.pokemons];
    
    if (this.currentTrainer?.team && this.currentTrainer.team.length > 0) {
      this.preselectTeam();
    }
  }
  
  onSearch(searchText: string): void {
    if (!searchText || searchText.trim() === '') {
      this.filteredPokemons = [...this.pokemons];
      return;
    }
    
    const searchTerm = searchText.toLowerCase();
    this.filteredPokemons = this.pokemons.filter(pokemon => 
      pokemon.name.toLowerCase().includes(searchTerm) || 
      pokemon.number.includes(searchTerm)
    );
  }

  updateSelectedPokemons(pokemons: Pokemon[]): void {
    this.selectedPokemons = pokemons;
  }

  saveSelection(): void {
    if (this.selectedPokemons.length === 0) {
      return;
    }
    
    this.isLoading = true;
    
    this.trainerService.savePokemonSelection(this.selectedPokemons.map(p => p.id)).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error saving pokemon selection:', error);
        this.isLoading = false;
      }
    });
  }
  
  goToPrevious(): void {
    this.router.navigate(['/profile-create']);
  }
}