import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, empty, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
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
        switchMap(basicPokemons => {
          const batchSize = 10;
          const batches = [];
          
          for (let i = 0; i < basicPokemons.length; i += batchSize) {
            const batchPokemons = basicPokemons.slice(i, i + batchSize);
            
            const batchRequests = batchPokemons.map(pokemon => 
              this.getPokemonDetails(pokemon.id).pipe(
                map(details => {
                  return {
                    ...pokemon,
                    displaySprite: details.sprites?.other?.home?.front_default || details.sprites.front_default,
                    type: details.types.map(t => t.type.name),
                    stats: {
                      hp: this.getStatValue(details, 'hp'),
                      attack: this.getStatValue(details, 'attack'),
                      defense: this.getStatValue(details, 'defense'),
                      specialAttack: this.getStatValue(details, 'special-attack'),
                      specialDefense: this.getStatValue(details, 'special-defense'),
                      speed: this.getStatValue(details, 'speed')
                    }
                  };
                }),
                catchError(error => {
                  console.error(`Error fetching details for Pokémon ${pokemon.id}:`, error);
                  return of(pokemon);
                })
              )
            );
            
            batches.push(forkJoin(batchRequests));
          }
          
          return forkJoin(batches).pipe(
            map(batchResults => {
              return batchResults.flat();
            })
          );
        }),
        catchError(error => {
          console.error('Error fetching Pokémon list:', error);
          return of([]);
        })
      );
  }

  private getStatValue(details: PokemonDetails, statName: string): number {
    if (!details.stats || !Array.isArray(details.stats)) {
      return 0;
    }
    
    const stat = details.stats.find((s: { stat: { name: string }; base_stat: number }) => 
      s.stat.name === statName
    );
    
    return stat ? stat.base_stat : 0;
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

  getPokemonByIds(ids: number[]): Observable<Pokemon[]> {
    if (!ids || ids.length === 0) {
      return of([]);
    }
    
    return this.getFirstGeneration().pipe(
      map(allPokemons => {
        return allPokemons.filter(pokemon => ids.includes(pokemon.id));
      })
    );
  }
}