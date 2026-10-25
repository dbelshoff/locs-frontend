import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.css'],
})
export class CookieBannerComponent implements OnInit {
  showBanner = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const cookiesAccepted = localStorage.getItem('cookiesAccepted');
    if (!cookiesAccepted) {
      this.showBanner = true;
    }
  }

  aceitarCookies() {
    localStorage.setItem('cookiesAccepted', 'true');
    this.showBanner = false;
  }

  recusarCookies() {
    localStorage.setItem('cookiesAccepted', 'false');
    this.showBanner = false;
  }

  irParaPolitica() {
    this.router.navigate(['/privacidade']);
  }
}
