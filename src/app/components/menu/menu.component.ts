import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EstabelecimentoService } from '../../services/estabelecimento.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
})
export class MenuComponent implements OnInit {
  @Output() opcaoSelecionada = new EventEmitter<string>();
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

  irParaEdicao() {
    this.router.navigate(['dashboard/edicao']);
  }

  irParaInicio() {
    this.router.navigate(['dashboard/inicio']);
  }

  irParaGraficos() {}

  irParaPosts() {
    this.router.navigate(['dashboard/posts']);
  }
}
