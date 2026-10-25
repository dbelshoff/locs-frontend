// src/app/admin-post-form/admin-post-form.component.ts
import { Component, Input } from '@angular/core';
import { EmpresaService } from '../../services/empresa.service';
import { Post } from '../../models/post.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-post-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-post-form.component.html',
  styleUrls: ['./admin-post-form.component.css'],
})
export class AdminPostFormComponent {
  @Input() placeId: string = ''; // Add @Input to receive placeId from parent
  imagemSelecionada: File | null = null;
  imagemPreview: string | null = null;
  conteudo: string = '';
  expiresAt: string = '';

  constructor(private empresaService: EmpresaService) {}

  onImagemSelecionada(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.imagemSelecionada = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.imagemPreview = reader.result as string);
      reader.readAsDataURL(this.imagemSelecionada);
    }
  }

  criarPost() {
    if (
      !this.imagemSelecionada ||
      !this.placeId ||
      !this.conteudo ||
      !this.expiresAt
    ) {
      alert('Preencha todos os campos.');
      return;
    }

    // Passo 1: Fazer upload da imagem
    this.empresaService
      .uploadImagem(this.imagemSelecionada, this.placeId)
      .subscribe({
        next: (response) => {
          const imagemUrl = response.imagemUrl;

          // Passo 2: Criar o post com a URL da imagem
          const post: Post = {
            placeId: this.placeId,
            conteudo: this.conteudo,
            imagemUrl: imagemUrl,
            expiresAt: new Date(this.expiresAt),
            id: 0,
            createdAt: new Date(),
          };

          this.empresaService.criarPost(post).subscribe({
            next: () => {
              alert('Post criado com sucesso!');
              // Resetar formulário
              this.imagemSelecionada = null;
              this.imagemPreview = null;
              this.conteudo = '';
              this.expiresAt = '';
            },
            error: (err) => {
              console.error('Erro ao criar post:', err);
              alert(`Erro ao criar post: ${err.message || err.statusText}`);
            },
          });
        },
        error: (err) => {
          console.error('Erro ao fazer upload da imagem:', err);
          alert(
            `Erro ao fazer upload da imagem: ${err.message || err.statusText}`
          );
        },
      });
  }
}
