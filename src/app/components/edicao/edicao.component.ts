import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EstabelecimentoService } from '../../services/estabelecimento.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-edicao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edicao.component.html',
  styleUrls: ['./edicao.component.css'],
})
export class EdicaoComponent implements OnInit {
  editForm: FormGroup;
  estabelecimento: any | null = null;
  isLoading = false;
  mensagem: string | null = null;
  erro: string | null = null;
  isLoggedIn = false;
  fotoUrl: SafeUrl | null = null;

  constructor(
    private fb: FormBuilder,
    private estabelecimentoService: EstabelecimentoService,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.editForm = this.fb.group({
      nome: ['', Validators.required],
      formattedAddress: ['', Validators.required],
      logradouro: ['', Validators.required],
      numero: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', Validators.required],
      cep: ['', [Validators.pattern(/^\d{5}-\d{3}$/)]],
      telefone: [
        '',
        [Validators.required, Validators.pattern(/^\+55\d{10,11}$/)],
      ],
      fotoUrl: [''],
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.estabelecimentoService.getMeusEstabelecimentos().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.estabelecimento = data[0];

          this.editForm.patchValue({
            nome: this.estabelecimento.nome,
            formattedAddress: this.estabelecimento.formattedAddress,
            logradouro: this.estabelecimento.logradouro,
            numero: this.estabelecimento.numero,
            bairro: this.estabelecimento.bairro,
            cidade: this.estabelecimento.cidade,
            estado: this.estabelecimento.estado,
            cep: this.estabelecimento.cep, // Usar o campo Cep diretamente
            telefone: this.estabelecimento.telefone,
            fotoUrl: this.estabelecimento.fotoUrl,
          });

          if (this.estabelecimento.fotoUrl) {
            this.loadFoto(this.estabelecimento.fotoUrl);
          }
        } else {
          this.erro = 'Nenhum estabelecimento vinculado encontrado.';
          this.router.navigate(['/vinculo-empresa']);
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.erro =
          err.error?.mensagem || 'Erro ao carregar o estabelecimento.';
        this.isLoading = false;
      },
    });
  }

  loadFoto(fotoNome: string): void {
    this.estabelecimentoService.getFotoEstabelecimento(fotoNome).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.fotoUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
      },
      error: (err) => {
        this.erro =
          err.message || 'Erro ao carregar a foto do estabelecimento.';
      },
    });
  }

  salvarEdicao(): void {
    if (this.editForm.valid && this.estabelecimento) {
      this.isLoading = true;

      const formattedAddress = [
        this.editForm.value.logradouro,
        this.editForm.value.numero ? this.editForm.value.numero : '',
        this.editForm.value.bairro ? `- ${this.editForm.value.bairro}` : '',
        this.editForm.value.cidade,
        this.editForm.value.estado,
        this.editForm.value.cep || '',
      ]
        .filter((part) => part)
        .join(', ');

      const estabelecimentoDTO = {
        placeId: this.estabelecimento.placeId,
        nome: this.editForm.value.nome,
        formattedAddress: formattedAddress,
        logradouro: this.editForm.value.logradouro,
        numero: this.editForm.value.numero || '',
        bairro: this.editForm.value.bairro,
        cidade: this.editForm.value.cidade,
        estado: this.editForm.value.estado,
        cep: this.editForm.value.cep || '', // Incluir o campo Cep
        telefone: this.editForm.value.telefone,
        fotoUrl: this.editForm.value.fotoUrl || '',
        latitude: this.estabelecimento.latitude || 0,
        longitude: this.estabelecimento.longitude || 0,
        abertoAgora: this.estabelecimento.abertoAgora || false,
        types: this.estabelecimento.types || [],
        typesString: this.estabelecimento.typesString || '',
        rating: this.estabelecimento.rating || 0,
      };

      this.estabelecimentoService
        .editarEstabelecimento(this.estabelecimento.placeId, estabelecimentoDTO)
        .subscribe({
          next: () => {
            this.mensagem = 'Estabelecimento atualizado com sucesso!';
            this.erro = null;
            this.isLoading = false;
            setTimeout(() => this.router.navigate(['/dashboard/inicio']), 2000);
            this.estabelecimento = {
              ...this.estabelecimento,
              ...estabelecimentoDTO,
            };
            this.editForm.patchValue({ formattedAddress });
            if (this.editForm.value.fotoUrl !== this.estabelecimento.fotoUrl) {
              this.loadFoto(this.editForm.value.fotoUrl);
            }
          },
          error: (err) => {
            let errorMessage =
              err.error?.mensagem || 'Erro ao atualizar o estabelecimento.';
            if (err.error?.errors) {
              errorMessage = Object.entries(err.error.errors)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
            }
            this.erro = errorMessage;
            this.mensagem = null;
            this.isLoading = false;
          },
        });
    }
  }

  /*cancelarEdicao(): void {
    this.editForm.reset();
    this.editForm.patchValue({
      nome: this.estabelecimento.nome,
      formattedAddress: this.estabelecimento.formattedAddress,
      logradouro: this.estabelecimento.logradouro,
      numero: this.estabelecimento.numero,
      bairro: this.estabelecimento.bairro,
      cidade: this.estabelecimento.cidade,
      estado: this.estabelecimento.estado,
      cep: this.estabelecimento.cep, // Usar o campo Cep diretamente
      telefone: this.estabelecimento.telefone,
      fotoUrl: this.estabelecimento.fotoUrl,
    });
    this.mensagem = null;
    this.erro = null;
  }*/

  cancelarEdicao(): void {
    // volta para o início do dashboard
    this.router.navigate(['/dashboard/inicio']);
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }
}
