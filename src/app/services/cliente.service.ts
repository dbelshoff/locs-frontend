import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { AuthService } from './auth.service';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) {}

  cadastrar(cliente: Cliente): Observable<any> {
    return this.http.post(`${this.apiUrl}`, cliente);
  }

  obterCliente(clienteId: number, token: string): Observable<Cliente> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<Cliente>(`${this.apiUrl}/${clienteId}`, { headers });
  }
}
