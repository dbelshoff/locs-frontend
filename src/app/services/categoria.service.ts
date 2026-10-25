/*import { Categoria } from './../models/categoria.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  constructor(private http: HttpClient) {}
  private apiUrl = `${environment.apiUrl}/categorias`;

  getCategoria(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }
}*/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.model';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private apiUrl = `${environment.apiUrl}/categorias`;

  constructor(private http: HttpClient) {}

  getCategoria(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }
}
