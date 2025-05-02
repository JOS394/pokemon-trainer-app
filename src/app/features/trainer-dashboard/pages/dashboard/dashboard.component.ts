import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TrainerService } from '../../../../core/services/trainer.service';
import { PokemonService } from '../../../../core/services/pokemon.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';
import { Pokemon } from '../../../../core/models/pokemon.interface';
import { Trainer } from '../../../../core/models/trainer.interface';
import { TrainerInfoComponent } from '../../components/trainer-info/trainer-info.component';
import { TeamDisplayComponent } from '../../components/team-display/team-display.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LoaderComponent,
    TrainerInfoComponent,
    TeamDisplayComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  teamPokemons: Pokemon[] = [];
  isLoading: boolean = false;
  currentTrainer: Trainer | null = null;
  hasError: boolean = false;
  errorMessage: string = '';
  
  constructor(
    private trainerService: TrainerService,
    private pokemonService: PokemonService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadTrainerData();
  }

  loadTrainerData(): void {
    this.isLoading = true;
    this.hasError = false;
    
    // Get trainer profile
    this.trainerService.getTrainer().subscribe({
      next: (trainer) => {
        this.currentTrainer = trainer;
        
        // If trainer has a team, load the team Pokémon
        if (this.currentTrainer?.team && this.currentTrainer.team.length > 0) {
          this.loadTeamPokemons();
        } else {
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error loading trainer:', error);
        this.isLoading = false;
        this.router.navigate(['/profile-create']);
      }
    });
  }

  loadTeamPokemons(): void {
    if (!this.currentTrainer?.team || this.currentTrainer.team.length === 0) {
      this.isLoading = false;
      return;
    }
    
    this.pokemonService.getPokemonByIds(this.currentTrainer.team)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (pokemons: Pokemon[]) => {
          this.teamPokemons = pokemons;
        },
        error: (error: any) => {
          this.hasError = true;
          this.errorMessage = 'Error al cargar el equipo Pokémon. Por favor, intenta de nuevo más tarde.';
          console.error('Error loading Pokémon team:', error);
          this.isLoading = false;
        }
      });
  }
  
  editTeam(): void {
    this.router.navigate(['/team-selection']);
  }
  
  editProfile(): void {
    this.router.navigate(['/profile-create']);
  }
}