import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  authService = inject(AuthService);
  router = inject(Router);

  isUserLoggedIn: boolean = false;

  ngOnInit() {
    this.isLoggedIn();
  }

  isLoggedIn(): void {
    this.authService.isLoggedIn$.subscribe({
      next: (status) => {
        this.isUserLoggedIn = status;
      }
    })
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

}
