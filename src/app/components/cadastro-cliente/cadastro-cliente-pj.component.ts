import { FormsModule } from '@angular/forms';
import {
  ChangeDetectionStrategy,
  Component,
  ChangeDetectorRef,
} from '@angular/core';
import { Cliente } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente.service';
import { CommonModule } from '@angular/common';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-cadastro-cliente-pj',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cadastro-cliente-pj.component.html',
  styleUrl: './cadastro-cliente-pj.component.css',
})
export class CadastroClientePJComponent {
  cliente: any = {
    nome: '',
    cpf: '',
    email: '',
    senhaHash: '',
    telefone: '',
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
  };

  mensagem: string = '';

  constructor(
    private clienteService: ClienteService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  cadastrar(form: NgForm) {
    this.clienteService.cadastrar(this.cliente).subscribe({
      next: () => {
        this.mensagem = 'Cliente PJ cadastrado com sucesso!';
        this.cdr.markForCheck();

        this.authService
          .loginCliente({
            email: this.cliente.email,
            senha: this.cliente.senhaHash,
          })
          .subscribe({
            next: () => {
              setTimeout(() => {
                this.mensagem = '';
                this.cliente = {};
                form.resetForm();
                this.cdr.markForCheck();
                this.router.navigate(['/home']);
              }, 2000);
            },
            error: () => {
              this.mensagem = 'Erro ao fazer login após cadastro.';
              this.cdr.markForCheck();
            },
          });
      },
      error: (err) => {
        if (err.error && err.error.mensagem) {
          this.mensagem = err.error.mensagem;
        } else {
          this.mensagem = 'Erro ao cadastrar cliente PJ.';
        }
        this.cdr.markForCheck();
      },
    });
  }
}
