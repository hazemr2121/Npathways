import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import  {CustomValidators} from '../../validators/CustomValidator'

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class AdminLoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  showPassword = false;
  errorMessage: string | null = null;
  userName: string | null = null;
  userRole: string | null = null;
  isLoggedIn = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.email,
          Validators.required,
          CustomValidators.emailValidator()
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          CustomValidators.passwordStrengthValidator(), // Using the custom validator for password strength
        ],
      ],
    });
  }

  ngOnInit(): void {
    // Check if already logged in
    if (this.authService.hasToken()) {
      this.isLoggedIn = true;
      this.userName = this.authService.getUserName();
      this.userRole = this.authService.getUserRole();
      // Redirect after a short delay to show the welcome message
      setTimeout(() => {
        this.router.navigate(['/admin-dashboard']);
      }, 2000);
    }
  }

  // Getter methods for form controls
  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to trigger validation display
      Object.keys(this.loginForm.controls).forEach((key) => {
        const control = this.loginForm.get(key);
        control?.markAsTouched();
        control?.markAsDirty(); // Ensure dirty state is also marked
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading = false;
        this.isLoggedIn = true;
        this.userName = this.authService.getUserName();
        this.userRole = this.authService.getUserRole();
        // Redirect after a short delay to show the welcome message
        setTimeout(() => {
          this.router.navigate(['/admin-dashboard']);
        }, 2000);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoading = false;
        // Provide more specific error messages based on the error response
        if (error.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else {
          this.errorMessage = 'Login failed. Please try again later.';
        }
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}


