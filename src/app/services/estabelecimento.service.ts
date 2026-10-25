import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class EstabelecimentoService {
  private apiUrl = `${environment.apiUrl}/estabelecimentos`;
  private fotoUrl = `${environment.apiUrl}/Empresa`;

  constructor(private http: HttpClient) {}

  /*private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }*/

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  buscarEstabelecimentos(query: string): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/buscar?query=${encodeURIComponent(query)}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  verificarTelefone(placeId: string, telefone: string): Observable<any> {
    return this.http
      .post<any>(
        `${this.apiUrl}/verificar-telefone`,
        { placeId, telefone },
        { headers: this.getHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  validarCodigo(placeId: string, code: string): Observable<any> {
    return this.http
      .post<any>(
        `${this.apiUrl}/validar-codigo`,
        { placeId, code },
        { headers: this.getHeaders() }
      )
      .pipe(catchError(this.handleError));
  }

  getMeusEstabelecimentos(): Observable<any[]> {
    return this.http
      .get<any[]>(`${this.apiUrl}/meus`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError));
  }

  editarEstabelecimento(placeId: string, data: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${placeId}`, data, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getFotoEstabelecimento(fotoNome: string): Observable<Blob> {
    return this.http
      .get(`${this.fotoUrl}/foto?fotoNome=${encodeURIComponent(fotoNome)}`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }),
        responseType: 'blob',
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Erro na requisição:', error);
    return throwError(
      () =>
        new Error('Erro ao comunicar com a API. Tente novamente mais tarde.')
    );
  }
}
