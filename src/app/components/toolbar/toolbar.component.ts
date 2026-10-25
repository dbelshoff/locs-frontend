import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ClienteService } from '../../services/cliente.service';
import { Cliente } from '../../models/cliente.model';
import { Observable } from 'rxjs';
import { ViewportScroller } from '@angular/common';
import { MatSidenav } from '@angular/material/sidenav';
import { EstabelecimentoService } from '../../services/estabelecimento.service';

@Component({
  selector: 'toolbar',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    RouterModule,
    CommonModule,
  ],
  templateUrl: 'toolbar.component.html',
  styleUrl: 'toolbar.component.css',
})
export class ToolbarComponent implements OnInit, AfterViewInit {
  cliente: Cliente | null = null;
  cliente$!: Observable<Cliente | null>;
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    private router: Router,
    private clienteService: ClienteService,
    public authService: AuthService,
    private viewportScroller: ViewportScroller,
    private estabelecimentoService: EstabelecimentoService
  ) {}

  ngOnInit(): void {
    this.authService.cliente$.subscribe((cliente) => {
      this.cliente = cliente;
      console.log('Cliente atualizado:', cliente);
    });
  }

  ngAfterViewInit(): void {
    if (this.sidenav) {
      console.log('Sidenav inicializado com sucesso');
      // Adiciona um listener para o backdrop
      this.sidenav.openedChange.subscribe((opened) => {
        console.log('Sidenav estado:', opened ? 'Aberto' : 'Fechado');
      });
    } else {
      console.error('Sidenav não foi inicializado');
    }
  }

  toggleSidenav(): void {
    console.log('Botão do menu hamburguer clicado');
    if (this.sidenav) {
      this.sidenav.toggle();
    } else {
      console.error('Sidenav não está disponível');
    }
  }

  irParaCadastro() {
    this.router.navigate(['/perfil-cliente']);
  }

  irParaLogin() {
    this.router.navigate(['/login']);
  }

  irParaPerfil() {
    this.router.navigate(['/perfil']);
  }

  irParaDashboard(): void {
    this.estabelecimentoService.getMeusEstabelecimentos().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/vinculo-empresa']);
        }
      },
      error: () => {
        this.router.navigate(['/vinculo-empresa']);
      },
    });
  }

  irParaCarteira() {
    this.router.navigate(['/contato']);
  }

  toHome() {
    this.router.navigate(['/home']);
  }

  sair() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
