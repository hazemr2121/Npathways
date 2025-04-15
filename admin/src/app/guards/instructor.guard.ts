import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const instructorGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const userRole = authService.getUserRole();
  
  // If user is instructor, only allow access to course and exam management
  if (userRole === 'instructor') {
    const currentPath = router.url;
    const allowedPaths = ['/course-management', '/exam-management'];
    
    if (!allowedPaths.includes(currentPath)) {
      // Force redirect to course management
      return router.parseUrl('/course-management');
    }
  }

  // If user is admin, allow access to all routes
  if (userRole === 'admin') {
    return true;
  }

  // For any other case, redirect to course management
  return router.parseUrl('/course-management');
}; 