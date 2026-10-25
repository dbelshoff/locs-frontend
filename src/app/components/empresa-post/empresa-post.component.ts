import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  HostListener,
  ElementRef,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EmpresaService } from '../../services/empresa.service';
import { Post } from '../../models/post.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-empresa-posts',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './empresa-post.component.html',
  styleUrls: ['./empresa-post.component.css'],
})
export class EmpresaPostComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  currentIndex = 0;
  progress = 0;
  intervalId: any;
  paused = false;

  constructor(
    private empresaService: EmpresaService,
    public dialogRef: MatDialogRef<EmpresaPostComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { placeId: string },
    private el: ElementRef
  ) {}

  ngOnInit(): void {
    this.empresaService.getPosts(this.data.placeId).subscribe({
      next: (posts) => {
        const now = new Date();
        this.posts = posts.filter((p) => new Date(p.expiresAt) > now);

        if (this.posts.length === 0) {
          this.dialogRef.close();
          return;
        }

        this.startAutoPlay();
      },
      error: (err) => console.error('Erro ao carregar posts:', err),
    });
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  getImagemUrl(imagemNome: string): string {
    return `${environment.apiUrl}/posts/imagem?imagemNome=${encodeURIComponent(
      imagemNome
    )}`;
  }

  handleImageError(event: Event) {
    (event.target as HTMLImageElement).src = '/assets/fallback-image.png';
  }

  nextSlide() {
    if (this.currentIndex < this.posts.length - 1) {
      this.currentIndex++;
      this.resetProgress();
    } else {
      this.dialogRef.close();
    }
  }

  prevSlide() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.resetProgress();
    }
  }

  fechar() {
    this.dialogRef.close();
  }

  // --- AutoPlay & Progress ---
  startAutoPlay() {
    this.stopAutoPlay();
    const duration = 5000;
    const step = 100;
    const increment = (step / duration) * 100;

    this.progress = 0;
    this.intervalId = setInterval(() => {
      if (!this.paused) {
        this.progress += increment;
        if (this.progress >= 100) {
          this.nextSlide();
        }
      }
    }, step);
  }

  stopAutoPlay() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resetProgress() {
    this.progress = 0;
    this.startAutoPlay();
  }

  pauseStory() {
    this.paused = true;
  }

  resumeStory() {
    this.paused = false;
  }

  // --- Toque rápido em qualquer lado da tela ---
  handleTap(event: MouseEvent | TouchEvent) {
    const container = this.el.nativeElement.querySelector('.story-container');
    const rect = container.getBoundingClientRect();
    const x =
      event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;

    const middle = rect.left + rect.width / 2;
    if (x < middle) {
      this.prevSlide();
    } else {
      this.nextSlide();
    }
  }

  // --- Navegação por teclado ---
  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') this.nextSlide();
    if (event.key === 'ArrowLeft') this.prevSlide();
    if (event.key === 'Escape') this.fechar();
  }
}
