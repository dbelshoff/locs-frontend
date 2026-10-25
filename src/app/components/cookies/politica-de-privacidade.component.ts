import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-politica-de-privacidade.component.ts',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './politica-de-privacidade.component.html',
  styleUrl: './politica-de-privacidade.component.css',
})
export class PrivacidadeComponent {
  constructor(private router: Router) {}

  toHome() {
    this.router.navigate(['/home']);
  }
}
