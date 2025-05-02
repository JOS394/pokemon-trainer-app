import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Pokemon, PokemonDetails, PokemonListResponse } from '../models/pokemon.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private readonly POKEMON_LIMIT = 151; 
  private readonly apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getFirstGeneration(): Observable<Pokemon[]> {
  return this.http.get<PokemonListResponse>(`${this.apiUrl}/pokemon?limit=${this.POKEMON_LIMIT}`)
    .pipe(
      map(response => {
        return response.results.map((pokemon, index) => {
          const id = index + 1;
          return {
            id: id,
            name: pokemon.name,
            url: pokemon.url,
            number: String(id).padStart(3, '0'),
            imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`
          };
        });
      }),
      catchError(error => {
        console.error('Error fetching Pokémon list:', error);
        return of([]);
      })
    );
}

  getPokemonDetails(idOrName: string | number): Observable<PokemonDetails> {
    return this.http.get<PokemonDetails>(`${this.apiUrl}/pokemon/${idOrName}`)
      .pipe(
        map(pokemon => {
          const sprite = pokemon.sprites?.other?.home?.front_default || pokemon.sprites.front_default;
          
          return {
            ...pokemon,
            displaySprite: sprite
          };
        }),
        catchError(error => {
          console.error(`Error fetching details for Pokémon ${idOrName}:`, error);
          throw error;
        })
      );
  }

  getPokemonTeamDetails(ids: (string | number)[]): Observable<PokemonDetails[]> {
    if (!ids.length) {
      return of([]);
    }
    
    const requests = ids.map(id => this.getPokemonDetails(id));
    
    return forkJoin(requests).pipe(
      catchError(error => {
        console.error('Error fetching team details:', error);
        return of([]);
      })
    );
  }

  searchPokemon(query: string, pokemonList: Pokemon[]): Pokemon[] {
    if (!query || !query.trim()) {
      return pokemonList;
    }

    const normalizedQuery = query.toLowerCase().trim();
    
    return pokemonList.filter(pokemon => 
      pokemon.name.toLowerCase().includes(normalizedQuery) || 
      pokemon.id.toString() === normalizedQuery
    );
  }
}