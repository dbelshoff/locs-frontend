import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { EmpresaCardComponent } from './empresa-card.component';
import { EmpresaService } from '../../services/empresa.service';
import { Empresa } from '../../models/empresa.model';
import { LocalizacaoService } from '../../services/localizacao.service';
import { FiltroEmpresa } from '../../models/filtro-empresa.model';
import { CategoriaComponent } from '../categoria/categoria.component';

@Component({
  selector: 'app-empresa-lista',
  standalone: true,
  imports: [
    EmpresaCardComponent,
    CommonModule,
    CategoriaComponent,
    FormsModule,
  ],
  templateUrl: './empresa-lista.component.html',
  styleUrls: ['./empresa-lista.component.css'],
})
export class EmpresaListaComponent implements OnInit, OnDestroy {
  empresasExatas: Empresa[] = [];
  empresasProximas: Empresa[] = [];

  categoriaSelecionada = '';
  bairro = '';
  cidade = '';
  estado = '';

  latitude?: number;
  longitude?: number;

  selectLocalizacao = true;
  nenhumaEmpresaEncontrada = true;
  isLoading = false;

  private destroy$ = new Subject<void>();
  private buscaAtualId = 0;

  @Input() mostrarCampoCategoria = true;
  @Input() mostrarResultados = true;

  @Output() categoriaEscolhida = new EventEmitter<string>();

  textoPesquisa = '';

  @ViewChild(CategoriaComponent)
  categoriaComponent!: CategoriaComponent;

  constructor(
    private empresaService: EmpresaService,
    private localizacaoService: LocalizacaoService,
  ) {}

  ngOnInit(): void {
    this.localizacaoService.localizacaoAtualizada$
      .pipe(takeUntil(this.destroy$))
      .subscribe((atualizada) => {
        if (atualizada) {
          this.carregarEmpresas();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarEmpresasPorCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
    this.categoriaEscolhida.emit(categoria);
    this.carregarEmpresas();
  }

  buscarCategoria(): void {
    const categoria = this.categoriaComponent?.categoriaControl.value?.trim();

    if (categoria) {
      this.carregarEmpresasPorCategoria(categoria);
    }
  }

  carregarEmpresas(): void {
    const buscaId = ++this.buscaAtualId;

    this.bairro = this.localizacaoService.bairro;
    this.cidade = this.localizacaoService.cidade;
    this.estado = this.localizacaoService.estado;
    this.latitude = this.localizacaoService.latitude;
    this.longitude = this.localizacaoService.longitude;

    const filtro: FiltroEmpresa = {
      categoria: this.categoriaSelecionada || undefined,
      bairro: this.bairro || undefined,
      cidade: this.cidade || undefined,
      estado: this.estado || undefined,
      latitude: this.latitude,
      longitude: this.longitude,
    };

    // Não inicia a busca enquanto não houver localização válida.
    if (!this.estado || this.latitude == null || this.longitude == null) {
      this.selectLocalizacao = false;
      this.nenhumaEmpresaEncontrada = true;
      this.empresasExatas = [];
      this.empresasProximas = [];
      this.isLoading = false;
      return;
    }

    this.selectLocalizacao = true;
    this.isLoading = true;

    this.localizacaoService.definirEstadoCarregamento('buscando');

    // Limpa resultados anteriores durante a nova pesquisa.
    this.empresasExatas = [];
    this.empresasProximas = [];
    this.nenhumaEmpresaEncontrada = true;

    // Etapa 1: busca rápida no banco de dados.
    this.empresaService
      .getEmpresasFiltradas(filtro, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (empresasBanco: Empresa[]) => {
          if (buscaId !== this.buscaAtualId) {
            return;
          }

          // Exibe os resultados locais enquanto a busca completa acontece.
          this.dividirEmpresas(empresasBanco);

          this.nenhumaEmpresaEncontrada =
            this.empresasExatas.length === 0 &&
            this.empresasProximas.length === 0;

          // Etapa 2: busca completa, incluindo Google Places.
          this.empresaService
            .getEmpresasFiltradas(filtro)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (empresasCompletas: Empresa[]) => {
                if (buscaId !== this.buscaAtualId) {
                  return;
                }

                const empresasUnicas = new Map<string, Empresa>();

                // Combina os resultados sem duplicar estabelecimentos.
                for (const empresa of [
                  ...empresasBanco,
                  ...empresasCompletas,
                ]) {
                  const chave =
                    empresa.placeId ||
                    `${empresa.nome}|${empresa.cidade}|${empresa.estado}`;

                  if (!empresasUnicas.has(chave)) {
                    empresasUnicas.set(chave, empresa);
                  }
                }

                this.dividirEmpresas(Array.from(empresasUnicas.values()));

                this.nenhumaEmpresaEncontrada =
                  this.empresasExatas.length === 0 &&
                  this.empresasProximas.length === 0;

                this.finalizarCarregamento();
              },

              error: (err) => {
                if (buscaId !== this.buscaAtualId) {
                  return;
                }

                console.error(
                  'Erro ao complementar empresas com resultados completos:',
                  err,
                );

                // Mantém os resultados do banco se a busca completa falhar.
                this.dividirEmpresas(empresasBanco);

                this.nenhumaEmpresaEncontrada =
                  this.empresasExatas.length === 0 &&
                  this.empresasProximas.length === 0;

                this.finalizarCarregamento();
              },
            });
        },

        error: (err) => {
          if (buscaId !== this.buscaAtualId) {
            return;
          }

          console.error('Erro ao carregar empresas do banco:', err);

          // Se a busca rápida falhar, tenta a busca completa.
          this.empresaService
            .getEmpresasFiltradas(filtro)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (empresas: Empresa[]) => {
                if (buscaId !== this.buscaAtualId) {
                  return;
                }

                this.dividirEmpresas(empresas);

                this.nenhumaEmpresaEncontrada =
                  this.empresasExatas.length === 0 &&
                  this.empresasProximas.length === 0;

                this.finalizarCarregamento();
              },

              error: (erroCompleto) => {
                if (buscaId !== this.buscaAtualId) {
                  return;
                }

                console.error('Erro ao carregar empresas:', erroCompleto);

                this.empresasExatas = [];
                this.empresasProximas = [];
                this.nenhumaEmpresaEncontrada = true;

                this.finalizarCarregamento();
              },
            });
        },
      });
  }

  private finalizarCarregamento(): void {
    this.isLoading = false;
    this.localizacaoService.definirEstadoCarregamento('pronto');
  }

  /*private dividirEmpresas(empresas: Empresa[]): void {
    const filtroBairro = this.bairro?.toLowerCase().trim();
    const filtroCidade = this.cidade?.toLowerCase().trim();
    const filtroEstado = this.estado?.toLowerCase().trim();

    this.empresasExatas = [];
    this.empresasProximas = [];

    empresas.forEach((empresa) => {
      const empresaBairro = empresa.bairro?.toLowerCase().trim();
      const empresaCidade = empresa.cidade?.toLowerCase().trim();
      const empresaEstado = empresa.estado?.toLowerCase().trim();

      const mesmaCidadeEstado =
        empresaCidade === filtroCidade && empresaEstado === filtroEstado;

      if (mesmaCidadeEstado) {
        const correspondeExata = filtroBairro
          ? empresaBairro === filtroBairro
          : true;

        if (correspondeExata) {
          this.empresasExatas.push(empresa);
        } else {
          this.empresasProximas.push(empresa);
        }
      }
    });
  }*/

  private dividirEmpresas(empresas: Empresa[]): void {
    const filtroBairro = this.bairro?.toLowerCase().trim();
    const filtroCidade = this.cidade?.toLowerCase().trim();
    const filtroEstado = this.estado?.toLowerCase().trim();

    this.empresasExatas = [];
    this.empresasProximas = [];

    empresas.forEach((empresa) => {
      const empresaBairro = empresa.bairro?.toLowerCase().trim();
      const empresaCidade = empresa.cidade?.toLowerCase().trim();
      const empresaEstado = empresa.estado?.toLowerCase().trim();

      const mesmaCidadeEstado =
        empresaCidade === filtroCidade && empresaEstado === filtroEstado;

      if (mesmaCidadeEstado) {
        const correspondeExata = filtroBairro
          ? empresaBairro === filtroBairro
          : true;

        if (correspondeExata) {
          this.empresasExatas.push(empresa);
        } else {
          this.empresasProximas.push(empresa);
        }
      }
    });

    // Ordena cada lista da menor para a maior distância.
    this.empresasExatas.sort(
      (a, b) => this.obterDistanciaKm(a) - this.obterDistanciaKm(b),
    );

    this.empresasProximas.sort(
      (a, b) => this.obterDistanciaKm(a) - this.obterDistanciaKm(b),
    );
  }

  private obterDistanciaKm(empresa: Empresa): number {
    const latOrigem = this.latitude;
    const lonOrigem = this.longitude;
    const latDestino = empresa.latitude;
    const lonDestino = empresa.longitude;

    // Empresas sem coordenadas válidas ficam no final.
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
      return Number.POSITIVE_INFINITY;
    }

    const radianos = (graus: number): number => (graus * Math.PI) / 180;

    const dLat = radianos(latDestino - latOrigem);
    const dLon = radianos(lonDestino - lonOrigem);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(radianos(latOrigem)) *
        Math.cos(radianos(latDestino)) *
        Math.sin(dLon / 2) ** 2;

    // Evita pequenas imprecisões numéricas fora do intervalo [0, 1].
    const valorLimitado = Math.min(1, Math.max(0, a));
    const arco =
      2 * Math.atan2(Math.sqrt(valorLimitado), Math.sqrt(1 - valorLimitado));

    return 6371 * arco;
  }

  selecionarCategoriaExterna(categoria: string): void {
    this.carregarEmpresasPorCategoria(categoria);

    if (this.categoriaComponent) {
      this.categoriaComponent.selecionarCategoria(categoria);
    }
  }

  limparCategoria(): void {
    this.categoriaSelecionada = '';
    this.carregarEmpresas();

    this.categoriaComponent?.limparInput();
  }
}
