import { Component, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../../../core/models/pokemon.interface';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonService } from '../../../../core/services/pokemon.service';

@Component({
  selector: 'app-pokemon-list',
  standalone: true,
  imports: [CommonModule, PokemonCardComponent],
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss']
})
export class PokemonListComponent {
  @Input() pokemons: Pokemon[] = [];
  @Input() selectedPokemons: Pokemon[] = [];
  @Input() maxSelection: number = 3;
  
  allPokemons: Pokemon[] = [];
  filteredPokemons: Pokemon[] = [];
  displayedPokemons: Pokemon[] = [];
  maxDisplay: number = 9;
  searchText: string = '';

  constructor(private pokemonService: PokemonService) {}
  
  @Output() selectionChange = new EventEmitter<Pokemon[]>();
  @Output() saveTeam = new EventEmitter<void>();
  
  isPokemonSelected(pokemon: Pokemon): boolean {
    return this.selectedPokemons.some(p => p.id === pokemon.id);
  }

  shouldShowLowOpacity(): boolean {
    return this.selectedPokemons.length === this.maxSelection;
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pokemons']) {
      this.updateDisplayedPokemons();
    }
  }

  togglePokemonSelection(pokemon: Pokemon): void {
    const index = this.selectedPokemons.findIndex(p => p.id === pokemon.id);
    
    if (index === -1) {
      if (this.selectedPokemons.length < this.maxSelection) {
        const newSelection = [...this.selectedPokemons, pokemon];
        this.selectionChange.emit(newSelection);
      }
    } else {
      const newSelection = [...this.selectedPokemons];
      newSelection.splice(index, 1);
      this.selectionChange.emit(newSelection);
    }
  }

  onSaveTeam(): void {
    this.saveTeam.emit();
  }

  updateDisplayedPokemons(): void {
    // Limit displayed Pokémon to 9
    this.displayedPokemons = this.pokemons.slice(0, this.maxDisplay);
  }

  onSearchChange(searchText: string): void {
    this.searchText = searchText.toLowerCase();
    
    if (!this.searchText) {
      this.filteredPokemons = [...this.allPokemons];
    } else {
      this.filteredPokemons = this.allPokemons.filter(pokemon => 
        pokemon.name.toLowerCase().includes(this.searchText) || 
        pokemon.number.toString().includes(this.searchText)
      );
    }
    
    this.updateDisplayedPokemons();
  }

  filterPokemons(): void {
    this.filteredPokemons = this.allPokemons.filter(pokemon =>
      pokemon.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
    this.displayedPokemons = this.filteredPokemons.slice(0, this.maxDisplay);
  }
}