import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { CoursesService, Course } from '../../services/course.service';
import { CertificatesService, Certificate as CertificateType } from '../../services/certificates.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { EditCertificateDialogComponent } from './edit-certificate-dialog.component';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { CertificateService } from '../../services/certificate.service';
import { PathwayService, Pathway } from '../../services/pathway.service';
// import { UserService } from '../../services/user.service';
// --- Placeholder Import ---
// import { CertificatesService, Certificate } from '../../services/certificates.service';

// Updated interface to match actual API response
export interface Certificate {
  _id: string;
  name: string;
  description: string;
  course?: string; // This is the course ID
  pathway?: string; // This is the pathway ID
  createdAt: string;
  __v: number;
}

// Custom validator function for minimum word count
function hasMinimumWords(minWords: number) {
  return (control: NgModel) => {
    if (!control.value) {
      return null;
    }
    const wordCount = control.value.trim().split(/\s+/).length;
    return wordCount >= minWords ? null : { minWords: true };
  };
}

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatButtonModule
  ],
  providers: [CertificatesService, CertificateService, PathwayService],
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css']
})
export class CertificateComponent implements OnInit {
  // --- Form Properties ---
  courses: Course[] = [];
  pathways: Pathway[] = [];
  users: any[] = [];
  selectedCourseId: string | null = null;
  selectedPathwayId: string | null = null;
  certificateName: string = '';
  certificateDescription: string = '';
  assignmentType: 'course' | 'pathway' = 'course';
  grantAssignmentType: 'course' | 'pathway' = 'course';

  // Validation states
  isDescriptionValid: boolean = true;
  isEditDescriptionValid: boolean = true;

  // --- Certificate List Properties ---
  certificates: CertificateType[] = []; // To store existing certificates

  // --- Granting Properties ---
  selectedCertificateIdForGranting: string | null = null;
  selectedUserIdForGranting: string | null = null;

  // --- UI State ---
  isLoadingCertificates: boolean = false;
  isLoadingUsers: boolean = false;
  isCreating: boolean = false;
  isGranting: boolean = false;
  isDeleting: string | null = null; // Store ID of certificate being deleted
  isUpdating: string | null = null; // Store ID of certificate being updated

  // --- Update Properties ---
  editingCertificate: CertificateType | null = null;
  editName: string = '';
  editDescription: string = '';

  // Add validator functions
  validateDescription = hasMinimumWords(5);

  constructor(
    private courseService: CoursesService,
    private certificatesService: CertificatesService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private certificateService: CertificateService,
    private pathwayService: PathwayService,
    // private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadCourses();
    this.loadPathways();
    this.loadCertificates();
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (data) => { this.courses = data; },
      error: (err) => console.error('Error loading courses:', err)
    });
  }

  loadPathways(): void {
    this.pathwayService.getAllPathways().subscribe({
      next: (response) => {
        this.pathways = response.data;
      },
      error: (err) => {
        console.error('Error loading pathways:', err);
        this.snackBar.open('Error loading pathways', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  loadCertificates(): void {
    this.isLoadingCertificates = true;
    console.log('Loading certificates...');

    this.certificatesService.getCertificates().subscribe({
      next: (data) => {
        this.certificates = data;
        console.log('Certificates loaded:', this.certificates);
        this.isLoadingCertificates = false;
      },
      error: (err) => {
        console.error('Error loading certificates:', err);
        this.isLoadingCertificates = false;
        // Add user feedback
      }
    });
  }

  // loadUsers(courseId: string): void {
  //   this.isLoadingUsers = true;
  //   this.userService.getUsersByCourse(courseId).subscribe({
  //     next: (data) => {
  //       this.users = data;
  //       this.isLoadingUsers = false;
  //     },
  //     error: (error) => {
  //       console.error('Error loading students:', error);
  //       this.isLoadingUsers = false;
  //       // Add user feedback
  //     }
  //   });
  // }

  onCertificateSelectForGranting(certificateId: string): void {
    this.selectedCertificateIdForGranting = certificateId;
    this.selectedUserIdForGranting = null; // Reset user selection
    this.users = []; // Clear previous users

    // Find the selected certificate
    const selectedCertificate = this.certificates.find(cert => cert._id === certificateId);
    if (!selectedCertificate) return;

    this.isLoadingUsers = true;

    if (selectedCertificate.course) {
      // Handle course students
      console.log('Loading users for Course ID:', selectedCertificate.course);
      this.courseService.getUsersInCourse(selectedCertificate.course).subscribe({
        next: (data) => {
          this.users = data.users || data || [];
          console.log('Course users loaded:', this.users);
          this.isLoadingUsers = false;
          if (this.users.length === 0) {
            console.warn('No users found for this course.');
          }
        },
        error: (err) => {
          console.error('Error loading users for course:', err);
          this.isLoadingUsers = false;
          this.snackBar.open('Error loading course students', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    } else if (selectedCertificate.pathway) {
      // Handle pathway students
      console.log('Loading users for Pathway ID:', selectedCertificate.pathway);
      this.pathwayService.getStudentsInPathway(selectedCertificate.pathway).subscribe({
        next: (response) => {
          this.users = response.data || [];
          console.log('Pathway users loaded:', this.users);
          this.isLoadingUsers = false;
          if (this.users.length === 0) {
            console.warn('No users found for this pathway.');
          }
        },
        error: (err) => {
          console.error('Error loading users for pathway:', err);
          this.isLoadingUsers = false;
          this.snackBar.open('Error loading pathway students', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  // Validation methods
  validateDescriptionOnBlur(): void {
    if (!this.certificateDescription) {
      this.isDescriptionValid = true; // Don't show error if empty (required will handle that)
      return;
    }

    const wordCount = this.certificateDescription.trim().split(/\s+/).length;
    this.isDescriptionValid = wordCount >= 5;

    // if (!this.isDescriptionValid) {
    //   this.snackBar.open('Description must contain at least 5 words', 'Close', {
    //     duration: 3000,
    //     panelClass: ['error-snackbar'],
    //     verticalPosition: 'top',
    //     horizontalPosition: 'right'
    //   });
    // }
  }

  validateEditDescriptionOnBlur(): void {
    if (!this.editDescription) {
      this.isEditDescriptionValid = true; // Don't show error if empty (required will handle that)
      return;
    }

    const wordCount = this.editDescription.trim().split(/\s+/).length;
    this.isEditDescriptionValid = wordCount >= 5;

    if (!this.isEditDescriptionValid) {
      this.snackBar.open('Description must contain at least 5 words', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    }
  }

  // --- Certificate Creation ---
  createCertificate(): void {
    if (!this.certificateName || !this.certificateDescription) {
      this.snackBar.open('Name and Description are required', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (this.assignmentType === 'course' && !this.selectedCourseId) {
      this.snackBar.open('Please select a course', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (this.assignmentType === 'pathway' && !this.selectedPathwayId) {
      this.snackBar.open('Please select a pathway', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    // Validate description word count
    const wordCount = this.certificateDescription.trim().split(/\s+/).length;
    if (wordCount < 5) {
      this.snackBar.open('Description must contain at least 5 words', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isCreating = true;
    const certificateData = {
      name: this.certificateName,
      description: this.certificateDescription,
      course: this.assignmentType === 'course' ? this.selectedCourseId || undefined : undefined,
      pathway: this.assignmentType === 'pathway' ? this.selectedPathwayId || undefined : undefined
    };

    this.certificatesService.createCertificate(certificateData).subscribe({
      next: (newCertificate) => {
        console.log('Certificate created successfully:', newCertificate);
        this.loadCertificates();
        // Reset form
        this.certificateName = '';
        this.certificateDescription = '';
        this.selectedCourseId = null;
        this.selectedPathwayId = null;
        this.isCreating = false;
        this.snackBar.open('Certificate created successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          verticalPosition: 'top',
          horizontalPosition: 'right',
        });
      },
      error: (err) => {
        console.error('Error creating certificate:', err);
        this.isCreating = false;
        this.snackBar.open(err.error?.message || 'Error creating certificate', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          verticalPosition: 'top',
          horizontalPosition: 'right',
        });
      }
    });
  }

  // --- Certificate Update ---
  startEdit(certificate: CertificateType): void {
    const dialogRef = this.dialog.open(EditCertificateDialogComponent, {
      width: '500px',
      data: {
        certificate: { ...certificate },
        editName: certificate.name,
        editDescription: certificate.description
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.editingCertificate = certificate;
        this.editName = result.editName;
        this.editDescription = result.editDescription;
        this.updateCertificate();
      }
    });
  }

  cancelEdit(): void {
    this.editingCertificate = null;
    this.editName = '';
    this.editDescription = '';
    this.isUpdating = null;
  }

  updateCertificate(): void {
    if (!this.editingCertificate || !this.editName || !this.editDescription) {
      this.snackBar.open('Certificate, Name, and Description must be provided for update', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
      return;
    }

    // Validate description word count
    const wordCount = this.editDescription.trim().split(/\s+/).length;
    if (wordCount < 5) {
      this.snackBar.open('Description must contain at least 5 words', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
      return;
    }

    this.isUpdating = this.editingCertificate._id;
    const updateData = {
      name: this.editName,
      description: this.editDescription
    };
    console.log('Updating certificate with data:', updateData);

    this.certificatesService.updateCertificate(this.editingCertificate._id, updateData).subscribe({
      next: (updatedCertificate) => {
        console.log('Certificate updated successfully:', updatedCertificate);
        this.loadCertificates(); // Reload the list
        this.cancelEdit(); // Reset edit state
        this.isUpdating = null;
        this.snackBar.open('Certificate updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      },
      error: (err) => {
        console.error('Error updating certificate:', err);
        this.isUpdating = null;
        this.snackBar.open(err.error?.message || 'Error updating certificate', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
    });
  }

  // --- Certificate Granting ---
  grantCertificate(): void {
    if (!this.selectedCertificateIdForGranting || !this.selectedUserIdForGranting) {
      this.snackBar.open('Please select both certificate and student', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
      return;
    }
    this.isGranting = true;
    const grantData = {
      certificateId: this.selectedCertificateIdForGranting,
      userId: this.selectedUserIdForGranting
    };
    console.log('Granting certificate with data:', grantData);

    this.certificatesService.grantCertificate(grantData.certificateId, grantData.userId).subscribe({
      next: (response) => {
        console.log('Certificate granted successfully:', response);
        // Reset selections
        this.selectedCertificateIdForGranting = null;
        this.selectedUserIdForGranting = null;
        this.isGranting = false;
        // Show success notification
        this.snackBar.open('Certificate granted successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      },
      error: (err) => {
        console.error('Error granting certificate:', err);
        this.isGranting = false;
        // Show error notification
        this.snackBar.open(err.error?.message || 'Error granting certificate', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          verticalPosition: 'top',
          horizontalPosition: 'right'
        });
      }
    });
  }

  // --- Certificate Deletion ---
  deleteCertificate(id: string): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Certificate',
        message: 'Are you sure you want to delete this certificate? This might affect granted certificates.',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isDeleting = id;
        console.log('Deleting certificate ID:', id);

        this.certificatesService.deleteCertificate(id).subscribe({
          next: () => {
            console.log('Certificate deleted successfully.');
            this.loadCertificates(); // Reload list
            this.isDeleting = null;
            // If the deleted certificate was selected for granting, reset selection
            if (this.selectedCertificateIdForGranting === id) {
              this.selectedCertificateIdForGranting = null;
            }
            this.snackBar.open('Certificate deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar'],
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
          },
          error: (err) => {
            console.error('Error deleting certificate:', err);
            this.isDeleting = null;
            this.snackBar.open(err.error?.message || 'Error deleting certificate', 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar'],
              verticalPosition: 'top',
              horizontalPosition: 'right'
            });
          }
        });
      }
    });
  }

  // Helper to get course name - requires course data to be available
  getCourseName(courseId: string | undefined): string {
    if (!courseId) return 'N/A';
    const course = this.courses.find(c => c._id === courseId);
    return course ? course.name : 'Unknown Course';
  }

  // Helper methods for certificate filtering
  getCourseCertificates(): CertificateType[] {
    return this.certificates.filter(cert => cert.course);
  }

  getPathwayCertificates(): CertificateType[] {
    return this.certificates.filter(cert => cert.pathway);
  }

  getPathwayName(pathwayId: string | undefined): string {
    if (!pathwayId) return 'N/A';
    const pathway = this.pathways.find(p => p._id === pathwayId);
    return pathway ? pathway.name : 'Unknown Pathway';
  }
}
