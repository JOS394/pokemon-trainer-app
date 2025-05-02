import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { Pokemon, PokemonDetails } from '../../core/models/pokemon.interface';
import { PokemonService } from '../../core/services/pokemon.service';
import { finalize } from 'rxjs';

/**
 * Store for managing Pokémon state using Angular Signals
 * Provides reactive state for Pokémon lists and selected team
 */
@Injectable({
  providedIn: 'root'
})
export class PokemonStore {
  private pokemonService = inject(PokemonService);
  
  // State signals
  private pokemonList = signal<Pokemon[]>([]);
  private selectedPokemonTeam = signal<PokemonDetails[]>([]);
  private loadingPokemon = signal<boolean>(false);
  private searchQuery = signal<string>('');
  
  // Computed values
  public readonly filteredPokemonList: Signal<Pokemon[]> = computed(() => {
    return this.pokemonService.searchPokemon(this.searchQuery(), this.pokemonList());
  });
  
  public readonly isLoading: Signal<boolean> = computed(() => this.loadingPokemon());
  public readonly team: Signal<PokemonDetails[]> = computed(() => this.selectedPokemonTeam());
  public readonly teamCount: Signal<number> = computed(() => this.selectedPokemonTeam().length);
//   public readonly isTeamFull: Signal<number> = computed(() => this.teamCount() >= 3);
  
  constructor() {
    this.loadPokemonList();
  }
  
  /**
   * Updates the search query for filtering Pokémon
   * @param query - The search string
   */
  updateSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }
  
  /**
   * Adds a Pokémon to the team if not already present and team is not full
   * @param pokemonId - Pokémon ID to add
   */
  addToTeam(pokemonId: number): void {
    // if (this.isTeamFull()) {
    //   console.warn('Team is already full. Remove a Pokémon before adding a new one.');
    //   return;
    // }
    
    // Check if Pokémon is already in team
    const isAlreadyInTeam = this.selectedPokemonTeam().some(p => p.id === pokemonId);
    if (isAlreadyInTeam) {
      console.warn(`Pokémon #${pokemonId} is already in your team.`);
      return;
    }
    
    this.loadingPokemon.set(true);
    
    this.pokemonService.getPokemonDetails(pokemonId)
      .pipe(finalize(() => this.loadingPokemon.set(false)))
      .subscribe({
        next: (pokemon) => {
          this.selectedPokemonTeam.update(team => [...team, pokemon]);
        },
        error: (error) => {
          console.error(`Failed to add Pokémon #${pokemonId} to team:`, error);
        }
      });
  }
  
  /**
   * Removes a Pokémon from the team
   * @param pokemonId - Pokémon ID to remove
   */
  removeFromTeam(pokemonId: number): void {
    this.selectedPokemonTeam.update(team => team.filter(pokemon => pokemon.id !== pokemonId));
  }
  
  /**
   * Sets the team directly with an array of Pokémon details
   * @param team - Array of Pokémon details
   */
  setTeam(team: PokemonDetails[]): void {
    this.selectedPokemonTeam.set(team);
  }
  
  /**
   * Gets the Pokémon IDs from the current team
   * @returns Array of Pokémon IDs
   */
  getTeamIds(): number[] {
    return this.selectedPokemonTeam().map(pokemon => pokemon.id);
  }
  
  /**
   * Loads the first generation Pokémon list
   */
  private loadPokemonList(): void {
    this.loadingPokemon.set(true);
    
    this.pokemonService.getFirstGeneration()
      .pipe(finalize(() => this.loadingPokemon.set(false)))
      .subscribe({
        next: (pokemonList) => {
          this.pokemonList.set(pokemonList);
        },
        error: (error) => {
          console.error('Failed to load Pokémon list:', error);
          // Could show an error notification here
        }
      });
  }
  
  /**
   * Loads the Pokémon team details from an array of IDs
   * @param ids - Array of Pokémon IDs
   */
  loadTeamFromIds(ids: number[]): void {
    if (!ids.length) {
      this.selectedPokemonTeam.set([]);
      return;
    }
    
    this.loadingPokemon.set(true);
    
    this.pokemonService.getPokemonTeamDetails(ids)
      .pipe(finalize(() => this.loadingPokemon.set(false)))
      .subscribe({
        next: (teamDetails) => {
          this.selectedPokemonTeam.set(teamDetails);
        },
        error: (error) => {
          console.error('Failed to load team details:', error);
          // Could show an error notification here
        }
      });
  }
}