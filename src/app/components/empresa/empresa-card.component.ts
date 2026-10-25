import { EmpresaPostComponent } from './../empresa-post/empresa-post.component';
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Empresa } from '../../models/empresa.model';
import { environment } from '../../../environment/environment';
import { MatDialog } from '@angular/material/dialog';
import { EmpresaService } from '../../services/empresa.service';
import { take } from 'rxjs/operators';
import { LocalizacaoService } from '../../services/localizacao.service';

@Component({
  selector: 'app-empresa-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empresa-card.component.html',
  styleUrls: ['./empresa-card.component.css'],
})
export class EmpresaCardComponent implements OnInit {
  @Input() empresa!: Empresa;
  mostrarContato: boolean = false;
  imagemUrl: string | null = null;
  temStories: boolean = false; // Novo: indica se a empresa tem stories

  constructor(
    private dialog: MatDialog,
    private empresaService: EmpresaService,
    private localizacaoService: LocalizacaoService,
  ) {}

  ngOnInit(): void {
    this.carregarImagem();

    // Verifica se a empresa tem posts ativos
    if (this.empresa?.placeId) {
      this.empresaService
        .getPosts(this.empresa.placeId)
        .pipe(take(1))
        .subscribe({
          next: (posts) => {
            this.temStories = posts && posts.length > 0;
          },
          error: (err) => console.error('Erro ao buscar posts:', err),
        });
    }
  }

  get distanciaKm(): number | null {
    const latOrigem = this.localizacaoService.latitude;
    const lonOrigem = this.localizacaoService.longitude;
    const latDestino = this.empresa?.latitude;
    const lonDestino = this.empresa?.longitude;

    if (
      latOrigem == null ||
      lonOrigem == null ||
      latDestino == null ||
      lonDestino == null ||
      !Number.isFinite(latOrigem) ||
      !Number.isFinite(lonOrigem) ||
      !Number.isFinite(latDestino) ||
      !Number.isFinite(lonDestino) ||
      Math.abs(latOrigem) > 90 ||
      Math.abs(latDestino) > 90 ||
      Math.abs(lonOrigem) > 180 ||
      Math.abs(lonDestino) > 180
    ) {
      return null;
    }

    const radianos = (graus: number) => (graus * Math.PI) / 180;
    const dLat = radianos(latDestino - latOrigem);
    const dLon = radianos(lonDestino - lonOrigem);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(radianos(latOrigem)) *
        Math.cos(radianos(latDestino)) *
        Math.sin(dLon / 2) ** 2;

    const arco = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return 6371 * arco;
  }

  get distanciaFormatada(): string | null {
    const distancia = this.distanciaKm;

    if (distancia === null) {
      return null;
    }

    if (distancia < 1) {
      return `${Math.round(distancia * 1000)} m de você`;
    }

    return `${distancia.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} km de você`;
  }

  // Abre os posts apenas se houver
  abrirPosts() {
    if (!this.empresa?.placeId) {
      console.warn('Empresa sem placeId definido.');
      return;
    }

    this.empresaService
      .getPosts(this.empresa.placeId)
      .pipe(take(1))
      .subscribe({
        next: (posts) => {
          if (posts && posts.length > 0) {
            this.dialog.open(EmpresaPostComponent, {
              data: { placeId: this.empresa.placeId },
              panelClass: 'story-dialog',
              backdropClass: 'story-backdrop',
            });
          } else {
            console.log('Nenhum post ativo para esta empresa.');
          }
        },
        error: (err) => {
          console.error('Erro ao buscar posts:', err);
        },
      });
  }

  private carregarImagem() {
    if (this.empresa.fotoUrl) {
      this.imagemUrl = `${environment.apiUrl}/Empresa/foto?fotoNome=${this.empresa.fotoUrl}`;
    } else {
      this.imagemUrl = 'assets/imagem-padrao.jpg'; // Fallback
    }
  }

  openMaps() {
    if (this.empresa.latitude && this.empresa.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${this.empresa.latitude},${this.empresa.longitude}`;
      window.open(url, '_blank');
    } else {
      alert('Coordenadas não disponíveis para esta empresa.');
    }
  }

  toggleContato() {
    this.mostrarContato = !this.mostrarContato;
  }

  getEstrelas(rating: number | undefined): string[] {
    const estrelas: string[] = [];
    const ratingValue = rating ?? 0;
    const inteiro = Math.floor(ratingValue);
    const temMeiaEstrela = ratingValue - inteiro >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < inteiro) {
        estrelas.push('full');
      } else if (i === inteiro && temMeiaEstrela) {
        estrelas.push('half');
      } else {
        estrelas.push('empty');
      }
    }
    return estrelas;
  }
}
