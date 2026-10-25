import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
//import { CategoriaComponent } from './components/categoria/categoria.component';
import { EmpresaListaComponent } from './components/empresa/empresa-lista.component';
import { LocalizacaoComponent } from './components/localizacao/localizacao.component';
import { FooterComponent } from './components/footer/footer.component';
//import { CadastroClienteComponent } from './components/cadastro-cliente/cadastro-cliente.component';
//import { routes } from '@angular/router';
import { CookieBannerComponent } from './components/cookies/cookie-banner.component';
import { NavigationEnd, Router } from '@angular/router';
import {
  Subject,
  filter,
  takeUntil,
  take,
  timeout,
  catchError,
  of,
} from 'rxjs';
import { AcessoService } from './services/acesso.service';
import { LocalizacaoService } from './services/localizacao.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ToolbarComponent,
    CommonModule,
    FooterComponent,
    CookieBannerComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'frontend';
  private readonly destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private acessoService: AcessoService,
    private localizacaoService: LocalizacaoService,
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntil(this.destroy$),
      )
      .subscribe((event) => {
        const pagina = event.urlAfterRedirects;

        this.localizacaoService.localizacaoAtualizada$
          .pipe(
            filter((atualizada) => atualizada),
            take(1),
            timeout({ first: 10000 }),
            catchError(() => of(false)),
            takeUntil(this.destroy$),
          )
          .subscribe(() => {
            const cidade = this.localizacaoService.cidade;
            const estado = this.localizacaoService.estado;
            const bairro = this.localizacaoService.bairro;

            console.log('Registrando acesso:', {
              pagina,
              cidade,
              estado,
              bairro,
            });

            this.acessoService
              .registrar(pagina, cidade, estado, 'Brasil')
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                error: (erro) => {
                  console.error('Não foi possível registrar o acesso.', erro);
                },
              });
          });
      });
  }

  private registrarAcesso(pagina: string): void {
    this.localizacaoService.estadoCarregamento$
      .pipe(
        filter(
          (estado) =>
            estado === 'pronto' || estado === 'manual' || estado === 'erro',
        ),
        take(1),
        timeout({ first: 10000 }),
        catchError(() => of('erro' as const)),
      )
      .subscribe(() => {
        this.acessoService
          .registrar(
            pagina,
            this.localizacaoService.cidade,
            this.localizacaoService.estado,
            'Brasil',
          )
          .subscribe({
            error: (erro) => console.error('Erro ao registrar acesso:', erro),
          });
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
