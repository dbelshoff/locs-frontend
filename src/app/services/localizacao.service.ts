import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Localizacao } from '../models/localizacao.model';
import { environment } from '../../environment/environment';

export type EstadoCarregamento =
  | 'localizando'
  | 'buscando'
  | 'pronto'
  | 'erro'
  | 'manual';

@Injectable({
  providedIn: 'root',
})
export class LocalizacaoService {
  private apiUrl = `${environment.apiUrl}/Endereco`;

  estado = '';
  cidade = '';
  bairro = '';
  latitude?: number;
  longitude?: number;

  private localizacaoSubject = new BehaviorSubject<boolean>(false);
  localizacaoAtualizada$ = this.localizacaoSubject.asObservable();

  private estadoCarregamentoSubject = new BehaviorSubject<EstadoCarregamento>(
    'localizando',
  );

  estadoCarregamento$ = this.estadoCarregamentoSubject.asObservable();

  definirEstadoCarregamento(estado: EstadoCarregamento): void {
    this.estadoCarregamentoSubject.next(estado);
  }

  constructor(private http: HttpClient) {}

  atualizarLocalizacao(
    estado: string,
    cidade: string,
    bairro: string,
  ): Observable<{ latitude: number; longitude: number }> {
    this.estado = estado;
    this.cidade = cidade;
    this.bairro = bairro;

    this.definirEstadoCarregamento('buscando');

    return this.getCoordenadas(estado, cidade, bairro).pipe(
      tap((coords) => {
        this.latitude = coords.latitude;
        this.longitude = coords.longitude;

        this.localizacaoSubject.next(true);
        this.definirEstadoCarregamento('pronto');
      }),
      catchError((err) => {
        console.error('Erro ao obter coordenadas', err);

        this.latitude = undefined;
        this.longitude = undefined;

        this.definirEstadoCarregamento('erro');

        return throwError(() => new Error('Erro ao obter coordenadas'));
      }),
    );
  }

  registrarLocalizacaoAutomatica(
    estado: string,
    cidade: string,
    bairro: string,
    latitude: number,
    longitude: number,
  ): void {
    this.estado = estado;
    this.cidade = cidade;
    this.bairro = bairro;
    this.latitude = latitude;
    this.longitude = longitude;

    this.localizacaoSubject.next(true);
    this.definirEstadoCarregamento('pronto');
  }

  getCoordenadas(
    estado: string,
    cidade: string,
    bairro: string,
  ): Observable<{ latitude: number; longitude: number }> {
    const params = new HttpParams()
      .set('estado', estado)
      .set('cidade', cidade)
      .set('bairro', bairro);

    return this.http.get<{ latitude: number; longitude: number }>(
      `${this.apiUrl}/coordenadas`,
      { params },
    );
  }

  getLocation(latitude: number, longitude: number): Observable<Localizacao> {
    return this.http
      .get<Localizacao>(
        `${this.apiUrl}/geolocalizacao?lat=${latitude}&lon=${longitude}`,
      )
      .pipe(
        tap(() => {
          this.latitude = latitude;
          this.longitude = longitude;
        }),
      );
  }
}
