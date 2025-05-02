import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../../../core/models/pokemon.interface';

@Component({
  selector: 'app-team-display',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './team-display.component.html',
  styleUrls: ['./team-display.component.scss']
})
export class TeamDisplayComponent implements OnChanges {
  @Input() teamPokemons: Pokemon[] = [];
  @Input() hasError: boolean = false;
  @Input() errorMessage: string = '';

  statLabels = [
    { key: 'stats.hp', label: 'HP' },
    { key: 'stats.attack', label: 'Ataque' },
    { key: 'stats.defense', label: 'Defensa' },
    { key: 'stats.specialAttack', label: 'Ataque Especial' },
    { key: 'stats.specialDefense', label: 'Defensa Especial' },
    { key: 'stats.speed', label: 'Velocidad' }
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teamPokemons'] && this.teamPokemons) {
      console.log('Team Pokemons cargados:', this.teamPokemons);
    }
  }

  getTypeClass(type: string): string {
    return `type-${type.toLowerCase()}`;
  }

  getStatPercentage(value: number): string {
    const percentage = (value / 255) * 100;
    return `${Math.max(Math.min(percentage, 100), 5)}%`;
  }

  getStatColor(value: number): string {
    if (value < 50) return '#FB6C6C';
    if (value < 90) return '#FFD86F';
    return '#A0E515';
  }
  
  getStat(pokemon: Pokemon, path: string): number {
    const parts = path.split('.');
    let result: any = pokemon;
    
    for (const part of parts) {
      if (result && typeof result === 'object' && part in result) {
        result = result[part];
      } else {
        return 0;
      }
    }
    
    return typeof result === 'number' ? result : 0;
  }

  getPokemonImage(pokemon: Pokemon): string {
    return pokemon.imageUrl || pokemon.displaySprite || '';
  }
  getPokemonTypes(pokemon: Pokemon): string[] {
    if (Array.isArray(pokemon.type)) {
      return pokemon.type;
    } else if (typeof (pokemon as any).types === 'object' && Array.isArray((pokemon as any).types)) {
      return (pokemon as any).types;
    }
    return [];
  }
  
  getPrimaryType(pokemon: Pokemon): string {
    const types = this.getPokemonTypes(pokemon);
    return types.length > 0 ? types[0].toLowerCase() : 'normal';
  }
  
  getTypeDisplay(pokemon: Pokemon): string {
    const types = this.getPokemonTypes(pokemon);
    if (types.length === 0) return '';
    
    const formattedTypes = types.map(type => {
      switch(type.toLowerCase()) {
        case 'grass': return 'planta';
        case 'poison': return 'veneno';
        case 'fire': return 'fuego';
        case 'water': return 'agua';
        case 'electric': return 'eléctrico';
        case 'ice': return 'hielo';
        case 'fighting': return 'lucha';
        case 'ground': return 'tierra';
        case 'flying': return 'volador';
        case 'psychic': return 'psíquico';
        case 'bug': return 'bicho';
        case 'rock': return 'roca';
        case 'ghost': return 'fantasma';
        case 'dragon': return 'dragón';
        case 'dark': return 'siniestro';
        case 'steel': return 'acero';
        case 'fairy': return 'hada';
        case 'normal': return 'normal';
        default: return type.toLowerCase();
      }
    });
    
    return formattedTypes.join('/');
  }
}