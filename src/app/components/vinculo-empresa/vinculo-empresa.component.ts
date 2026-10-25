/*import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EstabelecimentoService } from '../../services/estabelecimento.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vinculo-empresa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './vinculo-empresa.component.html',
  styleUrls: ['./vinculo-empresa.component.css'],
})
export class VinculoEmpresaComponent implements OnInit {
  buscaForm: FormGroup;
  verificacaoForm: FormGroup;
  validacaoForm: FormGroup;
  estabelecimentos: any[] = [];
  meusEstabelecimentos: any[] = [];
  mensagem: string | null = null;
  erro: string | null = null;
  selectedPlaceId: string | null = null;
  selectedEstabelecimento: any | null = null;
  mostrarVerificacaoTelefone = false;
  mostrarValidacaoCodigo = false;
  isLoggedIn = false;
  temEmpresasVinculadas = false;
  desejaVincular = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private estabelecimentoService: EstabelecimentoService,
    private authService: AuthService,
    private router: Router
  ) {
    this.buscaForm = this.fb.group({
      query: ['', Validators.required],
    });

    this.verificacaoForm = this.fb.group({
      telefone: [
        '',
        [Validators.required, Validators.pattern(/^\+55\d{10,11}$/)],
      ],
    });

    this.validacaoForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (!this.isLoggedIn) return;

    this.isLoading = true;
    this.estabelecimentoService.getMeusEstabelecimentos().subscribe({
      next: (data) => {
        this.meusEstabelecimentos = data;
        this.temEmpresasVinculadas = data.length > 0;
        if (this.temEmpresasVinculadas) this.desejaVincular = true;
        this.isLoading = false;
      },
      error: () => {
        this.erro = 'Erro ao carregar estabelecimentos vinculados.';
        this.isLoading = false;
      },
    });
  }

  irParaLogin(): void {
    this.router.navigate(['/login']);
  }

  irParaHome(): void {
    this.router.navigate(['/home']);
  }

  setDesejaVincular(value: boolean): void {
    this.desejaVincular = value;
    if (!value) this.irParaHome();
  }

  buscarEstabelecimentos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value.trim();
    if (query.length >= 3) {
      this.isLoading = true;
      this.estabelecimentoService.buscarEstabelecimentos(query).subscribe({
        next: (data) => {
          this.estabelecimentos = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.erro = err.message || 'Erro ao buscar estabelecimentos.';
          this.isLoading = false;
        },
      });
    } else {
      this.estabelecimentos = [];
    }
  }

  selecionarEstabelecimento(est: any): void {
    this.selectedEstabelecimento = est;
    this.estabelecimentos = []; // limpa a lista
    this.buscaForm.reset();
    this.iniciarVerificacao(est.placeId);
  }

  iniciarVerificacao(placeId: string): void {
    this.selectedPlaceId = placeId;
    this.mostrarVerificacaoTelefone = true;
    this.mostrarValidacaoCodigo = false;
    this.verificacaoForm.reset();
    this.validacaoForm.reset();
    this.mensagem = null;
    this.erro = null;
  }

  enviarCodigo(): void {
    if (this.verificacaoForm.valid && this.selectedPlaceId) {
      this.isLoading = true;
      const telefone = this.verificacaoForm.get('telefone')?.value;
      this.estabelecimentoService
        .verificarTelefone(this.selectedPlaceId, telefone)
        .subscribe({
          next: () => {
            this.mensagem =
              'Código enviado com sucesso! Verifique seu telefone.';
            this.erro = null;
            this.mostrarValidacaoCodigo = true;
            this.isLoading = false;
          },
          error: (err) => {
            this.erro = err.message || 'Erro ao enviar código.';
            this.mensagem = null;
            this.isLoading = false;
          },
        });
    }
  }

  validarCodigo(): void {
    if (this.validacaoForm.valid && this.selectedPlaceId) {
      this.isLoading = true;
      const code = this.validacaoForm.get('code')?.value;
      this.estabelecimentoService
        .validarCodigo(this.selectedPlaceId, code)
        .subscribe({
          next: () => {
            this.mensagem = 'Estabelecimento vinculado com sucesso!';
            this.erro = null;
            this.selectedPlaceId = null;
            this.selectedEstabelecimento = null;
            this.mostrarVerificacaoTelefone = false;
            this.mostrarValidacaoCodigo = false;
            this.verificacaoForm.reset();
            this.validacaoForm.reset();
            this.isLoading = false;
            this.ngOnInit();
          },
          error: (err) => {
            this.erro = err.message || 'Erro ao validar código.';
            this.mensagem = null;
            this.isLoading = false;
          },
        });
    }
  }
}*/

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EstabelecimentoService } from '../../services/estabelecimento.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vinculo-empresa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './vinculo-empresa.component.html',
  styleUrls: ['./vinculo-empresa.component.css'],
})
export class VinculoEmpresaComponent implements OnInit {
  buscaForm: FormGroup;
  verificacaoForm: FormGroup;
  validacaoForm: FormGroup;
  estabelecimentos: any[] = [];
  meusEstabelecimentos: any[] = [];
  mensagem: string | null = null;
  erro: string | null = null;
  selectedPlaceId: string | null = null;
  selectedEstabelecimento: any | null = null;
  mostrarVerificacaoTelefone = false;
  mostrarValidacaoCodigo = false;
  isLoggedIn = false;
  temEmpresasVinculadas = false;
  desejaVincular = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private estabelecimentoService: EstabelecimentoService,
    private authService: AuthService,
    private router: Router
  ) {
    this.buscaForm = this.fb.group({
      query: ['', Validators.required],
    });

    this.verificacaoForm = this.fb.group({
      telefone: [
        '',
        [Validators.required, Validators.pattern(/^\+55\d{10,11}$/)],
      ],
    });

    this.validacaoForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (!this.isLoggedIn) return;

    this.isLoading = true;
    this.estabelecimentoService.getMeusEstabelecimentos().subscribe({
      next: (data) => {
        this.meusEstabelecimentos = data;
        this.temEmpresasVinculadas = data.length > 0;
        if (this.temEmpresasVinculadas) this.desejaVincular = true;
        this.isLoading = false;
      },
      error: (err) => {
        this.erro =
          err.error?.mensagem ||
          'Erro ao carregar estabelecimentos vinculados.';
        this.isLoading = false;
      },
    });
  }

  irParaLogin(): void {
    this.router.navigate(['/login']);
  }

  irParaHome(): void {
    this.router.navigate(['/home']);
  }

  setDesejaVincular(value: boolean): void {
    this.desejaVincular = value;
    if (!value) this.irParaHome();
  }

  buscarEstabelecimentos(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value.trim();
    if (query.length >= 3) {
      this.isLoading = true;
      this.estabelecimentoService.buscarEstabelecimentos(query).subscribe({
        next: (data) => {
          this.estabelecimentos = data;
          this.isLoading = false;
        },
        error: (err) => {
          this.erro = err.error?.mensagem || 'Erro ao buscar estabelecimentos.';
          this.isLoading = false;
        },
      });
    } else {
      this.estabelecimentos = [];
      this.isLoading = false;
    }
  }

  selecionarEstabelecimento(est: any): void {
    this.selectedEstabelecimento = est;
    this.estabelecimentos = [];
    this.buscaForm.reset();
    this.iniciarVerificacao(est.placeId);
  }

  iniciarVerificacao(placeId: string): void {
    this.selectedPlaceId = placeId;
    this.mostrarVerificacaoTelefone = true;
    this.mostrarValidacaoCodigo = false;
    this.verificacaoForm.reset();
    this.validacaoForm.reset();
    this.mensagem = null;
    this.erro = null;
  }

  enviarCodigo(): void {
    if (this.verificacaoForm.valid && this.selectedPlaceId) {
      this.isLoading = true;
      const telefone = this.verificacaoForm.get('telefone')?.value;
      this.estabelecimentoService
        .verificarTelefone(this.selectedPlaceId, telefone)
        .subscribe({
          next: () => {
            this.mensagem =
              'Código enviado com sucesso! Verifique seu telefone.';
            this.erro = null;
            this.mostrarValidacaoCodigo = true;
            this.isLoading = false;
          },
          error: (err) => {
            this.erro =
              err.error?.mensagem ||
              'O número informado não é o número cadastrado dessa empresa.';
            this.mensagem = null;
            this.isLoading = false;
          },
        });
    }
  }

  validarCodigo(): void {
    if (this.validacaoForm.valid && this.selectedPlaceId) {
      this.isLoading = true;
      const code = this.validacaoForm.get('code')?.value;
      this.estabelecimentoService
        .validarCodigo(this.selectedPlaceId, code)
        .subscribe({
          next: () => {
            this.mensagem = 'Estabelecimento vinculado com sucesso!';
            this.erro = null;
            this.selectedPlaceId = null;
            this.selectedEstabelecimento = null;
            this.mostrarVerificacaoTelefone = false;
            this.mostrarValidacaoCodigo = false;
            this.verificacaoForm.reset();
            this.validacaoForm.reset();
            this.isLoading = false;
            this.ngOnInit();
          },
          error: (err) => {
            this.erro =
              err.error?.mensagem ||
              'Erro ao validar o código. Tente novamente.';
            this.mensagem = null;
            this.isLoading = false;
          },
        });
    }
  }
}
