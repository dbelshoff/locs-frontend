import { Component, OnInit } from '@angular/core';
import { EstabelecimentoService } from '../../services/estabelecimento.service';
import { CommonModule } from '@angular/common';
import { AdminPostFormComponent } from '../admin-post-form/admin-post-form.component'; // Importe o form que forneci

@Component({
  selector: 'app-posts-admin',
  standalone: true,
  imports: [CommonModule, AdminPostFormComponent],
  templateUrl: './posts-admin.component.html',
  styleUrls: ['./posts-admin.component.css'],
})
export class PostsAdminComponent implements OnInit {
  placeId: string | null = null;
  isLoading = true;
  erro: string | null = null;

  constructor(private estabelecimentoService: EstabelecimentoService) {}

  ngOnInit(): void {
    this.estabelecimentoService.getMeusEstabelecimentos().subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.placeId = data[0].placeId;
        } else {
          this.erro = 'Nenhum estabelecimento vinculado encontrado.';
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
}
