import { Categoria } from './categoria.model';
import { Endereco } from './endereco.models';
import { Foto } from './foto.model';

/*export interface Empresa {
  nome: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  telefone?: string;
  abertoAgora?: boolean;
  fotos?: { photoReference: string; width: number; height: number }[];
  placeId: string;
  types?: string[];
  rating?: number;
}*/

/*export interface Empresa {
  nome: string;
  formattedAddress: string;
  latitude?: number;
  longitude?: number;
  telefone?: string;
  abertoAgora?: boolean;
  fotoUrl?: string;
  placeId: string;
  types?: string[];
  rating?: number;
  endereco?: Endereco; // Endereço processado
}*/

export interface Empresa {
  placeId: string;
  nome: string;
  formattedAddress: string;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  latitude: number;
  longitude: number;
  telefone: string | null;
  abertoAgora: boolean;
  fotoUrl: string | null;
  types: string[];
  rating: number | null;
}
