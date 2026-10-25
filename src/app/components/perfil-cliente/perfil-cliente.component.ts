import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [],
  templateUrl: './perfil-cliente.component.html',
  styleUrl: './perfil-cliente.component.css',
})
export class PerfilClienteComponent {
  constructor(private router: Router) {}

  navegarParaPessoaFisica() {
    this.router.navigate(['/cadastro-cliente-pf']);
  }

  navegarParaPessoaJuridica() {
    this.router.navigate(['/cadastro-cliente-pj']);
  }
}
