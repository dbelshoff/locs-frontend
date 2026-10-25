import { Routes } from '@angular/router';
import { CadastroClientePFComponent } from './components/cadastro-cliente/cadastro-cliente-pf.component';
import { CadastroClientePJComponent } from './components/cadastro-cliente/cadastro-cliente-pj.component';
import { HomeComponent } from './home/home-component/home-component.component';
import { LoginComponent } from './auth/login/login.component';
import { PrivacidadeComponent } from './components/cookies/politica-de-privacidade.component';
import { PerfilClienteComponent } from './components/perfil-cliente/perfil-cliente.component';
import { VinculoEmpresaComponent } from './components/vinculo-empresa/vinculo-empresa.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EdicaoComponent } from './components/edicao/edicao.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { PostsAdminComponent } from './components/posts-admin/posts-admin.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'perfil-cliente', component: PerfilClienteComponent },
  { path: 'cadastro-cliente-pf', component: CadastroClientePFComponent },
  { path: 'cadastro-cliente-pj', component: CadastroClientePJComponent },
  { path: 'login', component: LoginComponent },
  { path: 'privacidade', component: PrivacidadeComponent },
  { path: 'vinculo-empresa', component: VinculoEmpresaComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'edicao', component: EdicaoComponent },
      { path: 'inicio', component: InicioComponent },
      // rotas futuras:
      // { path: 'graficos', component: GraficosComponent },
      { path: 'posts', component: PostsAdminComponent },
    ],
  },

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' },
];
