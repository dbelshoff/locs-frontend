import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  OnDestroy,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.css'],
})
export class CategoriaComponent implements OnInit, OnDestroy {
  categoriaControl = new FormControl('');
  @Output() categoriaSelecionada = new EventEmitter<string>();
  private destroy$ = new Subject<void>();
  @Output() textoAlterado = new EventEmitter<string>();

  constructor() {}

  //ngOnInit(): void {}
  ngOnInit(): void {
    this.categoriaControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((valor) => {
        this.textoAlterado.emit(valor ?? '');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buscarCategoria(): void {
    const categoria = this.categoriaControl.value?.trim();
    if (categoria) {
      this.categoriaSelecionada.emit(categoria);
    }
  }

  selecionarCategoria(categoria: string): void {
    this.categoriaControl.setValue(categoria, { emitEvent: false });
    this.categoriaSelecionada.emit(categoria);
  }

  limparInput(): void {
    this.categoriaControl.setValue('');
  }
}
