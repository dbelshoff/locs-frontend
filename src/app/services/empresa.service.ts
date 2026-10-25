/*import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa } from '../models/empresa.model';
import { FiltroEmpresa } from '../models/filtro-empresa.model';
import { environment } from '../../environment/environment';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {
  private apiUrlFiltrar = `${environment.apiUrl}/Empresa/filtrar-empresas`;
  private apiUrl = `${environment.apiUrl}/posts`; // Usa environment.apiUrl

  constructor(private http: HttpClient) {}

  getEmpresasFiltradas(filtro: FiltroEmpresa): Observable<Empresa[]> {
    let params = new HttpParams();

    if (filtro.latitude) params = params.set('lat', filtro.latitude.toString());
    if (filtro.longitude)
      params = params.set('lon', filtro.longitude.toString());
    if (filtro.estado) params = params.set('estado', filtro.estado.toString());
    if (filtro.cidade) params = params.set('cidade', filtro.cidade.toString());
    if (filtro.bairro) params = params.set('bairro', filtro.bairro.toString());
    if (filtro.categoria) params = params.set('query', filtro.categoria);

    return this.http.get<Empresa[]>(this.apiUrlFiltrar, { params });
  }

  // Método para obter o token JWT e configurar o header de autorização
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken'); // Ajuste a chave conforme sua implementação
    if (!token) {
      throw new Error('Token JWT não encontrado. Faça login novamente.');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Método para upload de imagem
  uploadImagem(
    imagem: File,
    placeId: string
  ): Observable<{ imagemUrl: string }> {
    const formData = new FormData();
    formData.append('imagem', imagem);
    formData.append('placeId', placeId);

    return this.http.post<{ imagemUrl: string }>(
      `${this.apiUrl}/upload-imagem`,
      formData,
      { headers: this.getAuthHeaders() }
    );
  }

  criarPost(post: Post): Observable<{ mensagem: string; postId: number }> {
    return this.http.post<{ mensagem: string; postId: number }>(
      this.apiUrl,
      post,
      { headers: this.getAuthHeaders() }
    );
  }

  // Método para obter posts
  getPosts(placeId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/${placeId}`);
  }

  // Método para obter imagem
  obterImagem(imagemNome: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/posts/imagem?imagemNome=${imagemNome}`,
      {
        responseType: 'blob',
      }
    );
  }
}*/

// src/app/services/empresa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Empresa } from '../models/empresa.model';
import { FiltroEmpresa } from '../models/filtro-empresa.model';
import { environment } from '../../environment/environment';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class EmpresaService {
  private apiUrlFiltrar = `${environment.apiUrl}/Empresa/filtrar-empresas`;
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  /*getEmpresasFiltradas(filtro: FiltroEmpresa): Observable<Empresa[]> {
    let params = new HttpParams();
    if (filtro.latitude) params = params.set('lat', filtro.latitude.toString());
    if (filtro.longitude)
      params = params.set('lon', filtro.longitude.toString());
    if (filtro.estado) params = params.set('estado', filtro.estado.toString());
    if (filtro.cidade) params = params.set('cidade', filtro.cidade.toString());
    if (filtro.bairro) params = params.set('bairro', filtro.bairro.toString());
    if (filtro.categoria) params = params.set('query', filtro.categoria);

    return this.http.get<Empresa[]>(this.apiUrlFiltrar, { params });
  }*/

  getEmpresasFiltradas(
    filtro: FiltroEmpresa,
    somenteBanco: boolean = false,
  ): Observable<Empresa[]> {
    let params = new HttpParams();

    if (filtro.latitude != null) {
      params = params.set('lat', filtro.latitude.toString());
    }

    if (filtro.longitude != null) {
      params = params.set('lon', filtro.longitude.toString());
    }

    if (filtro.estado) {
      params = params.set('estado', filtro.estado.toString());
    }

    if (filtro.cidade) {
      params = params.set('cidade', filtro.cidade.toString());
    }

    if (filtro.bairro) {
      params = params.set('bairro', filtro.bairro.toString());
    }

    if (filtro.categoria) {
      params = params.set('query', filtro.categoria);
    }

    if (somenteBanco) {
      params = params.set('somenteBanco', 'true');
    }

    return this.http.get<Empresa[]>(this.apiUrlFiltrar, { params });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Token JWT não encontrado. Faça login novamente.');
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  uploadImagem(
    imagem: File,
    placeId: string,
  ): Observable<{ imagemUrl: string }> {
    const formData = new FormData();
    formData.append('imagem', imagem);
    formData.append('placeId', placeId);

    return this.http.post<{ imagemUrl: string }>(
      `${this.apiUrl}/upload-imagem`,
      formData,
      { headers: this.getAuthHeaders() },
    );
  }

  criarPost(post: Post): Observable<{ mensagem: string; postId: number }> {
    return this.http.post<{ mensagem: string; postId: number }>(
      this.apiUrl,
      post,
      { headers: this.getAuthHeaders() },
    );
  }

  getPosts(placeId: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.apiUrl}/${placeId}`);
  }

  obterImagem(imagemNome: string): Observable<Blob> {
    const url = `${
      environment.apiUrl
    }/posts/imagem?imagemNome=${encodeURIComponent(imagemNome)}`;
    console.log('URL gerada para imagem:', url);
    return this.http.get(url, {
      responseType: 'blob',
    });
  }
}
