import {
  Component,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

import { Localizacao } from '../../models/localizacao.model';
import {
  LocalizacaoService,
  EstadoCarregamento,
} from '../../services/localizacao.service';

import estadosData from '../../../assets/data/estados.json';

interface Estado {
  id: number;
  sigla: string;
  cidades?: string[];
}

@Component({
  selector: 'app-localizacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './localizacao.component.html',
  styleUrls: ['./localizacao.component.css'],
})
export class LocalizacaoComponent implements OnInit, OnDestroy {
  @Output() localizacaoAtualizada = new EventEmitter<{
    latitude: number;
    longitude: number;
  }>();

  bairroAtual = '';
  cidadeAtual = '';
  estadoAtual = '';

  localizacaoDetectada = false;
  erro: string | null = null;

  estados: string[] = [];
  cidades: string[] = [];
  cidadesFiltradas: string[] = [];

  mostrarSugestoes = false;
  indiceSelecionado = -1;

  estadoSelecionado = '';
  cidadeSelecionada = '';
  bairroSelecionado = '';

  mostrandoFormulario = false;

  estadoCarregamento: EstadoCarregamento = 'localizando';

  private dadosEstados: Estado[] = estadosData;
  private localizacaoCancelada = false;
  private destroy$ = new Subject<void>();

  constructor(private localizacaoService: LocalizacaoService) {}

  ngOnInit(): void {
    this.carregarEstados();

    this.localizacaoService.estadoCarregamento$
      .pipe(takeUntil(this.destroy$))
      .subscribe((estado) => {
        this.estadoCarregamento = estado;
      });

    this.localizacaoService.localizacaoAtualizada$
      .pipe(takeUntil(this.destroy$))
      .subscribe((atualizada) => {
        const latitude = this.localizacaoService.latitude;
        const longitude = this.localizacaoService.longitude;

        if (atualizada && latitude !== undefined && longitude !== undefined) {
          this.localizacaoAtualizada.emit({ latitude, longitude });
        }
      });

    this.pegarLocalizacao();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private carregarEstados(): void {
    try {
      this.estados = this.dadosEstados.map((estado) => estado.sigla);
    } catch (err) {
      console.error('Erro ao carregar estados:', err);
      this.erro = 'Erro ao carregar estados do arquivo.';
    }
  }

  pegarLocalizacao(): void {
    this.localizacaoCancelada = false;
    this.erro = null;
    this.localizacaoDetectada = false;

    this.localizacaoService.definirEstadoCarregamento('localizando');

    if (!navigator.geolocation) {
      this.erro = 'Geolocalização não suportada neste navegador.';
      this.localizacaoService.definirEstadoCarregamento('erro');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Se o usuário escolheu localização manual, não sobrescreva a escolha.
        if (this.localizacaoCancelada) {
          return;
        }

        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        this.localizacaoService
          .getLocation(lat, lon)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (res: Localizacao) => {
              if (this.localizacaoCancelada) {
                return;
              }

              this.bairroAtual = res.bairro ?? '';
              this.cidadeAtual = res.cidade ?? '';
              this.estadoAtual = res.estado ?? '';

              console.log('Localização retornada pela API:', res);

              if (!this.estadoAtual || !this.cidadeAtual) {
                this.erro =
                  'Não foi possível identificar sua região. Escolha a localização manualmente.';
                this.localizacaoService.definirEstadoCarregamento('erro');
                return;
              }

              this.localizacaoDetectada = true;
              this.erro = null;

              // Mantém as coordenadas originais obtidas pelo navegador.
              // O serviço emite a localização atualizada e inicia a busca.
              this.localizacaoService.registrarLocalizacaoAutomatica(
                this.estadoAtual,
                this.cidadeAtual,
                this.bairroAtual,
                lat,
                lon,
              );
              console.log('Localização armazenada no serviço:', {
                cidade: this.localizacaoService.cidade,
                estado: this.localizacaoService.estado,
              });
            },
            error: (err) => {
              if (this.localizacaoCancelada) {
                return;
              }

              console.error('Erro ao obter endereço:', err);
              this.erro =
                'Não foi possível consultar seu endereço. Escolha a localização manualmente.';
              this.localizacaoService.definirEstadoCarregamento('erro');
            },
          });
      },
      (error) => {
        if (this.localizacaoCancelada) {
          return;
        }

        this.erro = this.getGeolocationErrorMessage(error);
        this.localizacaoService.definirEstadoCarregamento('erro');
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 120000,
      },
    );
  }

  private getGeolocationErrorMessage(error: GeolocationPositionError): string {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Permissão de localização negada. Escolha sua localização manualmente.';
      case error.POSITION_UNAVAILABLE:
        return 'Localização indisponível. Escolha sua localização manualmente.';
      case error.TIMEOUT:
        return 'O tempo para obter a localização esgotou. Tente novamente ou escolha manualmente.';
      default:
        return 'Não foi possível obter sua localização. Escolha manualmente.';
    }
  }

  alterarLocalizacao(): void {
    if (!this.mostrandoFormulario) {
      // Cancela logicamente qualquer resposta automática ainda pendente.
      this.localizacaoCancelada = true;

      // Preenche o formulário com a localização atual, quando disponível.
      this.estadoSelecionado = this.estadoAtual;
      this.cidadeSelecionada = this.cidadeAtual;
      this.bairroSelecionado = this.bairroAtual;

      this.onEstadoChange();

      // onEstadoChange limpa a cidade; restaura os valores existentes.
      this.cidadeSelecionada = this.cidadeAtual;
      this.bairroSelecionado = this.bairroAtual;
      this.cidadesFiltradas = this.cidades;

      this.erro = null;
      this.mostrandoFormulario = true;
      this.localizacaoService.definirEstadoCarregamento('manual');
      return;
    }

    if (!this.estadoSelecionado) {
      this.erro = 'Por favor, selecione um estado.';
      return;
    }

    this.estadoAtual = this.estadoSelecionado;
    this.cidadeAtual = this.cidadeSelecionada.trim();
    this.bairroAtual = this.bairroSelecionado.trim();

    this.erro = null;
    this.localizacaoDetectada = false;

    this.localizacaoService
      .atualizarLocalizacao(
        this.estadoAtual,
        this.cidadeAtual,
        this.bairroAtual,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.localizacaoDetectada = true;
          this.mostrandoFormulario = false;
          this.erro = null;
          // O serviço já emitiu localizacaoAtualizada$.
          // Não emitir o Output novamente aqui.
        },
        error: (err) => {
          console.error('Erro ao atualizar localização:', err);
          this.erro =
            'Não foi possível encontrar as coordenadas dessa localização. Verifique os dados e tente novamente.';
          this.localizacaoService.definirEstadoCarregamento('erro');
        },
      });
  }

  onEstadoChange(): void {
    if (!this.estadoSelecionado) {
      this.cidadeSelecionada = '';
      this.bairroSelecionado = '';
      this.cidades = [];
      this.cidadesFiltradas = [];
      this.mostrarSugestoes = false;
      return;
    }

    const estado = this.dadosEstados.find(
      (e) => e.sigla === this.estadoSelecionado,
    );

    this.cidades = estado?.cidades || [];
    this.cidadesFiltradas = this.cidades;
    this.cidadeSelecionada = '';
    this.bairroSelecionado = '';
    this.mostrarSugestoes = false;
  }

  filtrarCidades(): void {
    if (!this.cidadeSelecionada) {
      this.cidadesFiltradas = this.cidades;
      this.mostrarSugestoes = this.cidades.length > 0;
    } else {
      const termo = this.cidadeSelecionada.toLowerCase().trim();

      this.cidadesFiltradas = this.cidades.filter((cidade) =>
        cidade.toLowerCase().includes(termo),
      );

      this.mostrarSugestoes = this.cidadesFiltradas.length > 0;
    }

    this.indiceSelecionado = -1;
  }

  selecionarCidade(cidade: string): void {
    this.cidadeSelecionada = cidade;
    this.mostrarSugestoes = false;
    this.indiceSelecionado = -1;
    this.bairroSelecionado = '';
  }

  onCidadeBlur(): void {
    setTimeout(() => {
      this.mostrarSugestoes = false;
      this.indiceSelecionado = -1;
    }, 200);
  }

  onCidadeKeydown(event: KeyboardEvent): void {
    if (!this.mostrarSugestoes) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();

      if (this.indiceSelecionado < this.cidadesFiltradas.length - 1) {
        this.indiceSelecionado++;
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();

      if (this.indiceSelecionado > 0) {
        this.indiceSelecionado--;
      }
    } else if (event.key === 'Enter' && this.indiceSelecionado >= 0) {
      event.preventDefault();
      this.selecionarCidade(this.cidadesFiltradas[this.indiceSelecionado]);
    } else if (event.key === 'Escape') {
      this.mostrarSugestoes = false;
      this.indiceSelecionado = -1;
    }
  }
}
