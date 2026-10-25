import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

export interface RegistrarAcessoRequest {
  pagina: string;
  cidade?: string;
  estado?: string;
  pais?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AcessoService {
  private readonly apiUrl = `${environment.apiUrl}/Acessos`;

  constructor(private http: HttpClient) {}

  registrar(
    pagina: string,
    cidade?: string,
    estado?: string,
    pais: string = 'Brasil',
  ) {
    const dados: RegistrarAcessoRequest = {
      pagina,
      cidade: cidade || undefined,
      estado: estado || undefined,
      pais: pais || undefined,
    };

    return this.http.post<{ sucesso: boolean }>(this.apiUrl, dados);
  }
}
