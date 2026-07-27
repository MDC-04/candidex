import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  title = 'candidex-frontend';

  ngOnInit(): void {
    // Re-hydrate the authenticated user from the backend on startup
    // (the JWT alone does not contain the full profile, e.g. fullName).
    this.authService.loadCurrentUser();
  }
}
