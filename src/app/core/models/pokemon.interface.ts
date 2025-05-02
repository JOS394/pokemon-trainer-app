export interface Pokemon {
  id: number;
  name: string;
  imageUrl: string;
  number: string;
  type?: string[];
  stats?: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

export interface PokemonDetails {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    back_default?: string;
    front_shiny?: string;
    back_shiny?: string;
    other?: {
      home?: {
        front_default: string;
      }
    }
  };
  displaySprite: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
}

export interface PokemonSelectionRequest {
  pokemonIds: number[];
}

export interface PokemonSelectionResponse {
  success: boolean;
  message: string;
}