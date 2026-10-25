import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Cliente } from '../models/cliente.model';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';
import { ClienteService } from './cliente.service';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/cliente/login`;
  private clienteSubject = new BehaviorSubject<Cliente | null>(null);
  public cliente$ = this.clienteSubject.asObservable();
  private clienteId: number | null = null; // Variável para armazenar o id do cliente

  constructor(
    private http: HttpClient,
    private router: Router,
    private clienteService: ClienteService // Injete o ClienteService
  ) {
    this.loadClienteFromStorage();
  }

  loadClienteFromStorage(): void {
    const clienteId = localStorage.getItem('clienteId');
    const token = localStorage.getItem('accessToken');

    if (clienteId && token) {
      this.clienteService.obterCliente(+clienteId, token).subscribe({
        next: (cliente) => {
          this.clienteSubject.next(cliente);
        },
        error: (error) => {
          console.error('Erro ao carregar cliente do localStorage:', error);
          this.clienteSubject.next(null);
        },
      });
    }
  }

  /*loginCliente(loginData: {
    email: string;
    senha: string;
  }): Observable<Cliente> {
    return this.http
      .post<{ Token: string; clienteId: number }>(this.apiUrl, loginData)
      .pipe(
        switchMap((response) => {
          const clienteId = response.clienteId;
          const token = response.Token;

          // Armazena token e clienteId
          localStorage.setItem('clienteId', clienteId.toString());
          localStorage.setItem('accessToken', token);
          this.clienteId = clienteId;

          // Usa o ClienteService para buscar o cliente completo e já retorna esse Observable<Cliente>
          return this.clienteService.obterCliente(clienteId, token).pipe(
            tap((cliente) => {
              this.clienteSubject.next(cliente); // Atualiza o cliente logado
            })
          );
        }),


        catchError((error) => {
          let errorMsg = 'Erro desconhecido. Tente novamente mais tarde.';
          if (error.status === 401) {
            errorMsg = 'Email ou senha inválidos.';
          } else if (error.status === 0) {
            errorMsg = 'Erro de conexão com o servidor.';
          }



          return throwError(() => new Error(errorMsg));
        })
      );
  }*/

  loginCliente(loginData: {
    email: string;
    senha: string;
  }): Observable<Cliente> {
    return this.http
      .post<{ token: string; refreshToken: string; clienteId: number }>(
        this.apiUrl,
        loginData
      )
      .pipe(
        switchMap((response) => {
          const clienteId = response.clienteId; // Ajustado para camelCase
          const token = response.token; // Ajustado para camelCase

          console.log('Salvando no localStorage:', { clienteId, token }); // Log para depuração
          localStorage.setItem('clienteId', clienteId.toString());
          localStorage.setItem('accessToken', token);
          this.clienteId = clienteId;

          return this.clienteService.obterCliente(clienteId, token).pipe(
            tap((cliente) => {
              console.log('Cliente obtido:', cliente); // Log para depuração
              localStorage.setItem('clienteLogado', JSON.stringify(cliente)); // Opcional
              this.clienteSubject.next(cliente);
            })
          );
        }),
        catchError((error) => {
          console.error('Erro na requisição de login:', error); // Log detalhado
          let errorMsg = 'Erro desconhecido. Tente novamente mais tarde.';
          if (error.status === 401) {
            errorMsg = 'Email ou senha inválidos.';
          } else if (error.status === 0) {
            errorMsg = 'Erro de conexão com o servidor.';
          }
          return throwError(() => new Error(errorMsg));
        })
      );
  }

  // === CLIENTE LOGADO ===
  getClienteLogado(): Cliente | null {
    return this.clienteSubject.value;
  }

  getClienteObservable(): Observable<Cliente | null> {
    return this.clienteSubject.asObservable();
  }

  // === TOKEN ===
  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  // === VERIFICA SE ESTÁ LOGADO ===
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // === LOGOUT ===
  logout(): void {
    this.clienteSubject.next(null);
    localStorage.removeItem('clienteId');
    localStorage.removeItem('accessToken');
    this.router.navigate(['/home']);
  }

  // === PEGA CLIENTE DO LOCAL STORAGE ===
  private getClienteFromStorage(): Cliente | null {
    const clienteString = localStorage.getItem('clienteLogado');
    if (!clienteString || clienteString === 'undefined') return null;

    try {
      return JSON.parse(clienteString);
    } catch (e) {
      console.error('Erro ao fazer parse do cliente no localStorage:', e);
      return null;
    }
  }

  // === MÉTODO PARA PEGAR CABEÇALHO COM TOKEN ===
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // === OPCIONAL: DECODE DE JWT, SE PRECISAR DE INFORMAÇÕES ADICIONAIS ===
  decodeJwt(token: string): any {
    try {
      const payload = token.split('.')[1];
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(
        base64.length + ((4 - (base64.length % 4)) % 4),
        '='
      );
      return JSON.parse(atob(padded));
    } catch (e) {
      console.error('Erro ao decodificar token JWT:', e);
      return {};
    }
  }
}
