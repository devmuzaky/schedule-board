import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ThemeService } from './core/theme/theme.service';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor() {
    inject(ThemeService); // Initialize theme on app load
  }

  private auth = inject(AuthService);

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      this.auth.login('moezaky', 'password123').subscribe({ error: () => {} });
    }
  }
}
