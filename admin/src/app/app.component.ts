import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  
})
export class AppComponent {
  isLoggedIn = false;
  userName = '';
  userRole = '';

  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.updateAuthState();

    this.authService.isAuthenticated$.subscribe(() => {
      this.updateAuthState();
    });
  }

  private updateAuthState() {
    this.isLoggedIn = this.authService.hasToken();

    if (this.isLoggedIn) {
      // Get user info from token first
      const tokenUser = this.authService.getUserFromToken();
      if (tokenUser) {
        this.userRole = tokenUser.role || '';
        
        // Get profile details using the getProfile method
        this.authService.getProfile().subscribe({
          next: (profile) => {
            console.log('Profile data:', profile); // Debug log
            if (profile) {
              if (this.userRole === 'instructor') {
                this.userName = `${profile.firstName} ${profile.lastName}`;
                this.userRole = 'instructor';
              } else if (this.userRole === 'admin') {
                this.userName = `${profile.firstName} ${profile.lastName}`;
                this.userRole = 'admin';
              }
              
              // Redirect based on role
              if (this.userRole === 'instructor') {
                if (this.router.url !== '/course-management' && 
                    this.router.url !== '/exam-management') {
                  this.router.navigate(['/course-management']);
                }
              } else if (this.userRole === 'admin') {
                if (this.router.url === '/admin-login') {
                  this.router.navigate(['/admin-dashboard']);
                }
              }
            }
          },
          error: (err) => {
            console.error('Error loading profile:', err);
            // Keep the token user info if profile load fails
            if (!this.userName) {
              this.userName = '';
              this.userRole = '';
            }
          }
        });
      }
    } else {
      this.userName = '';
      this.userRole = '';
      this.router.navigate(['/admin-login']);
    }
  }

  logout() {
    this.authService.logout();
    this.userName = '';
    this.userRole = '';
    this.router.navigate(['/admin-login']);
  }
}
