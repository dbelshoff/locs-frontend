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
  selector: 'app-cadastro-cliente',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cadastro-cliente-pf.component.html',
  styleUrl: './cadastro-cliente-pf.component.css',
})
export class CadastroClientePFComponent {
  cliente: Cliente = {
    nome: '',
    email: '',
    senhaHash: '',
    telefone: '',
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
        this.mensagem = 'Cliente cadastrado com sucesso!';
        this.cdr.markForCheck();

        // Faz login automaticamente após o cadastro
        this.authService
          .loginCliente({
            email: this.cliente.email,
            senha: this.cliente.senhaHash,
          })
          .subscribe({
            next: () => {
              setTimeout(() => {
                this.mensagem = '';
                this.cliente = {
                  nome: '',
                  email: '',
                  senhaHash: '',
                  telefone: '',
                };
                form.resetForm();
                this.cdr.markForCheck();
                this.router.navigate(['/home']);
              }, 2000);
            },
            error: (err) => {
              this.mensagem = 'Erro ao fazer login após cadastro.';
              console.error('Erro no login:', err);
              this.cdr.markForCheck();
            },
          });
      },
      error: (err) => {
        console.error('Erro ao cadastrar:', err);

        // Verifica se veio uma mensagem específica do backend
        if (err.error && err.error.mensagem) {
          this.mensagem = err.error.mensagem;
        } else {
          this.mensagem = 'Erro ao cadastrar cliente.';
        }

        this.cdr.markForCheck();
      },
    });
  }
}
