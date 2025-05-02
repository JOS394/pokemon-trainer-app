import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pokemon } from '../../../../core/models/pokemon.interface';

@Component({
  selector: 'app-pokemon-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-card.component.html',
  styleUrls: ['./pokemon-card.component.scss']
})
export class PokemonCardComponent {
  @Input() pokemon!: Pokemon;
  @Input() selected: boolean = false;
  @Input() showLowOpacity: boolean = false;
  
  @Output() toggleSelection = new EventEmitter<Pokemon>();
  
  onToggleSelection(): void {
    this.toggleSelection.emit(this.pokemon);
  }
}