import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginData = { email: '', senha: '' };
  mensagem: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  login(form: NgForm) {
    if (!form.valid) {
      this.mensagem = 'Por favor, preencha todos os campos corretamente.';
      return;
    }

    this.authService.loginCliente(this.loginData).subscribe({
      next: (cliente) => {
        this.mensagem = 'Login realizado com sucesso!';
        this.cdr.markForCheck();

        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      },
      error: (err) => {
        this.mensagem = err.message;
        this.cdr.markForCheck();
      },
    });
  }
}
