import { Endereco } from './../models/endereco.models';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
//import { Empresa } from '../models/empresa.model'; // Ajuste o caminho conforme necessário
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class EnderecoService {
  private apiUrl = `${environment.apiUrl}/enderecos/por-empresa`;

  constructor(private http: HttpClient) {}

  getEnderecoPorEmpresa(empresaId: number): Observable<Endereco[]> {
    return this.http.get<Endereco[]>(`${this.apiUrl}/${empresaId}`);
  }
}
