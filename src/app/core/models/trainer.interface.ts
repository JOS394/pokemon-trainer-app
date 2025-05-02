/**
 * Trainer profile information
 */
export interface Trainer {
  id?: string;
  name: string;
  photo: string;
  birthDate: Date;
  age: number;
  hobby?: string;
  identification: Identification;
  team: number[]; // Array of Pokémon IDs in the trainer's team
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Identification types based on age
 */
export enum IdentificationType {
  DUI = 'dui',
  MINOR_ID = 'minorId'
}

/**
 * Identification information structure
 */
export interface Identification {
  type: IdentificationType;
  number: string;
}

/**
 * Form model for trainer profile
 */
export interface TrainerFormModel {
  name: string;
  photo: File | string;
  birthDate: Date;
  hobby?: string;
  identificationType: IdentificationType;
  identificationNumber: string;
}