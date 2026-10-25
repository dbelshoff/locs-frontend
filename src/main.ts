import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, RouterOutlet } from '@angular/router';
import { AppComponent } from './app/app.component';
import { LocalizacaoService } from './app/services/localizacao.service';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient(), LocalizacaoService, provideRouter(routes)],
}).catch((err) => console.error(err));
