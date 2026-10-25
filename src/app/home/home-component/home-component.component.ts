import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { LocalizacaoComponent } from '../../components/localizacao/localizacao.component';
import { EmpresaListaComponent } from '../../components/empresa/empresa-lista.component';

type Aba = 'inicio' | 'explorar';

@Component({
  selector: 'app-home-component',
  standalone: true,
  imports: [CommonModule, LocalizacaoComponent, EmpresaListaComponent],
  templateUrl: './home-component.component.html',
  styleUrl: './home-component.component.css',
})
export class HomeComponent {
  @ViewChild(EmpresaListaComponent)
  private empresaLista?: EmpresaListaComponent;

  abaAtiva: Aba = 'inicio';
  categoriaExplorarSelecionada = false;

  selecionarAba(aba: Aba): void {
    this.abaAtiva = aba;

    if (aba === 'inicio') {
      this.categoriaExplorarSelecionada = false;
      this.empresaLista?.limparCategoria();
    } else if (aba !== 'explorar') {
      this.categoriaExplorarSelecionada = false;
    }
  }

  explorarCategoria(categoria: string): void {
    this.abaAtiva = 'explorar';
    this.categoriaExplorarSelecionada = true;

    //this.empresaLista?.carregarEmpresasPorCategoria(categoria);

    this.empresaLista?.selecionarCategoriaExterna(categoria);
  }
}
