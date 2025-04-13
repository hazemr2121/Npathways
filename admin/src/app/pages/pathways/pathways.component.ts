import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import {
  PathwayService,
  Pathway,
  Student,
} from '../../services/pathway.service';
import { CoursesService, Course } from '../../services/course.service';
import { StudentService } from '../../services/student.service';
import { PathwayDetailsDialogComponent } from './pathway-details-dialog/pathway-details-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { switchMap, map, forkJoin, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfirmDeleteDialogComponent } from './confirm-delete-dialog/confirm-delete-dialog.component';

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
  selector: 'app-pathways',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatBadgeModule,
    PathwayDetailsDialogComponent,
    ConfirmDeleteDialogComponent
  ],
  templateUrl: './pathways.component.html',
  styleUrls: ['./pathways.component.css'],
})
export class PathwaysComponent implements OnInit {
  @ViewChild(PathwayDetailsDialogComponent)
  pathwayDetailsDialog?: PathwayDetailsDialogComponent;

  pathways: Pathway[] = [];
  courses: Course[] = [];
  allStudents: Student[] = [];
  formModel = {
    name: '',
    description: '',
    courses: [] as string[],
  };
  selectedCourseIds: string[] = [];
  notification = {
    message: '',
    type: '',
    show: false,
  };
  showDetailsDialog = false;
  selectedPathway: Pathway | null = null;

  // Validation states
  isNameValid: boolean = true;
  isDescriptionValid: boolean = true;

  // Delete confirmation dialog
  showDeleteDialog = false;
  pathwayToDelete: string | null = null;
  pathwayToDeleteName: string = '';

  constructor(
    private pathwayService: PathwayService,
    private courseService: CoursesService,
    private studentService: StudentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPathways();
    this.loadCourses();
    this.loadAllStudents();
  }

  loadCourses(): void {
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses.map((course) => ({
          _id: course._id || '',
          name: course.name,
          description: course.description || '',
          requiredExams: course.requiredExams || [],
          instructors: course.instructors || [],
          lessons: course.lessons || [],
        }));
      },
      error: (error) => {
        this.showNotification('Error loading courses', 'error');
        console.error('Error loading courses:', error);
      },
    });
  }

  loadAllStudents(): void {
    this.studentService.getAllStudents().subscribe({
      next: (students) => {
        this.allStudents = students;
      },
      error: (error) => {
        this.showNotification('Error loading students', 'error');
        console.error('Error loading students:', error);
      },
    });
  }

  loadPathways(): void {
    this.pathwayService
      .getAllPathways()
      .pipe(
        switchMap((response: any) => {
          const pathwaysData = Array.isArray(response)
            ? response
            : response.data || [];
          if (pathwaysData.length === 0) {
            return of([]);
          }
          const pathwayObservables: Observable<Pathway>[] = pathwaysData.map(
            (pathway: Pathway) =>
              this.pathwayService.getStudentsInPathway(pathway._id).pipe(
                map((studentResponse: any) => {
                  const students = Array.isArray(studentResponse)
                    ? studentResponse
                    : studentResponse.data &&
                      Array.isArray(studentResponse.data)
                    ? studentResponse.data
                    : [];
                  return {
                    ...pathway,
                    studentCount: students.length,
                  } as Pathway;
                }),
                catchError(() => {
                  console.error(
                    `Error fetching students for pathway ${pathway._id}`
                  );
                  return of({ ...pathway, studentCount: 0 } as Pathway);
                })
              )
          );
          return forkJoin<Pathway[]>(pathwayObservables);
        }),
        catchError((error) => {
          this.showNotification('Error loading pathways', 'error');
          console.error('Error loading pathways:', error);
          return of([]);
        })
      )
      .subscribe({
        next: (pathwaysWithCounts) => {
          this.pathways = pathwaysWithCounts;
          console.log('Loaded Pathways with Student Counts:', this.pathways);
        },
      });
  }

  createPathway(): void {
    // Validate before creating
    this.validateNameOnBlur();
    this.validateDescriptionOnBlur();

    if (!this.isNameValid || !this.isDescriptionValid) {
      return;
    }

    if (!this.formModel.name) {
      this.showNotification('Pathway name is required', 'error');
      return;
    }

    const pathway = {
      name: this.formModel.name,
      description: this.formModel.description,
      courses: this.selectedCourseIds,
    };

    this.pathwayService.createPathWay(pathway).subscribe({
      next: () => {
        this.showNotification('Pathway created successfully', 'success');
        this.loadPathways();
        this.resetForm();
      },
      error: (error) => {
        this.showNotification(
          error.error?.message || 'Error creating pathway',
          'error'
        );
        console.error('Error creating pathway:', error);
      },
    });
  }

  viewPathwayDetails(pathway: Pathway): void {
    this.selectedPathway = { ...pathway };
    this.showDetailsDialog = true;
  }

  closeDetailsDialog(): void {
    this.showDetailsDialog = false;
    this.selectedPathway = null;
  }

  deletePathway(pathwayId: string, pathwayName: string): void {
    this.pathwayToDelete = pathwayId;
    this.pathwayToDeleteName = pathwayName;
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    if (!this.pathwayToDelete) {
      return;
    }

    this.pathwayService.deletePathway(this.pathwayToDelete).subscribe({
      next: () => {
        this.showNotification('Pathway deleted successfully', 'success');
        this.loadPathways();
      },
      error: (error) => {
        console.error('Error deleting pathway:', error);
        this.showNotification('Error deleting pathway', 'error');
      }
    });

    this.closeDeleteDialog();
  }

  closeDeleteDialog(): void {
    this.showDeleteDialog = false;
    this.pathwayToDelete = null;
    this.pathwayToDeleteName = '';
  }

  onEnrollStudent(event: { pathwayId: string; userId: string }) {
    this.pathwayService
      .enrollUserByAdmin(event.pathwayId, event.userId)
      .subscribe({
        next: () => {
          this.snackBar.open('Student enrolled successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          // Notify the dialog to refresh its data
          if (this.pathwayDetailsDialog) {
            this.pathwayDetailsDialog.onEnrollmentSuccess();
          }
          this.loadPathways(); // Update pathway student counts
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.message || 'Error enrolling student',
            'Close',
            {
              duration: 3000,
              panelClass: ['error-snackbar'],
            }
          );
          console.error('Error enrolling student:', error);
        },
      });
  }

  onUnenrollStudent(event: { pathwayId: string; userId: string }) {
    this.pathwayService
      .unenrollUserByAdmin(event.pathwayId, event.userId)
      .subscribe({
        next: () => {
          this.snackBar.open('Student unenrolled successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar'],
          });
          // Notify the dialog to refresh its data
          if (this.pathwayDetailsDialog) {
            this.pathwayDetailsDialog.onUnenrollmentSuccess();
          }
          this.loadPathways(); // Update pathway student counts
        },
        error: (error) => {
          this.snackBar.open(
            error.error?.message || 'Error unenrolling student',
            'Close',
            {
              duration: 3000,
              panelClass: ['error-snackbar'],
            }
          );
          console.error('Error unenrolling student:', error);
        },
      });
  }

  toggleCourseSelection(courseId: string): void {
    const index = this.selectedCourseIds.indexOf(courseId);
    if (index === -1) {
      this.selectedCourseIds.push(courseId);
    } else {
      this.selectedCourseIds.splice(index, 1);
    }
  }

  isCourseSelected(courseId: string): boolean {
    return this.selectedCourseIds.includes(courseId);
  }

  resetForm(): void {
    this.formModel = {
      name: '',
      description: '',
      courses: [],
    };
    this.selectedCourseIds = [];
  }

  showNotification(message: string, type: 'success' | 'error'): void {
    this.notification = {
      message,
      type,
      show: true,
    };
    setTimeout(() => {
      this.notification.show = false;
    }, 3000);
  }

  getCourseName(courseId: string): string {
    const course = this.courses.find((c) => c._id === courseId);
    return course ? course.name : 'Unknown Course';
  }

  onSavePathway(updatedPathway: Pathway): void {
    if (!updatedPathway._id) return;

    this.pathwayService.updatePathway(updatedPathway._id, updatedPathway).subscribe({
      next: () => {
        this.showNotification('Pathway updated successfully', 'success');
        this.loadPathways();
        this.closeDetailsDialog();
      },
      error: (error) => {
        this.showNotification(
          error.error?.message || 'Error updating pathway',
          'error'
        );
        console.error('Error updating pathway:', error);
      },
    });
  }

  // Validation methods
  validateNameOnBlur(): void {
    if (!this.formModel.name) {
      this.isNameValid = true; // Don't show error if empty (required will handle that)
      return;
    }

    this.isNameValid = this.formModel.name.length >= 3;

    if (!this.isNameValid) {
      this.snackBar.open('Pathway name must be at least 3 characters long', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    }
  }

  validateDescriptionOnBlur(): void {
    if (!this.formModel.description) {
      this.isDescriptionValid = true; // Don't show error if empty (required will handle that)
      return;
    }

    const wordCount = this.formModel.description.trim().split(/\s+/).length;
    this.isDescriptionValid = wordCount >= 5;

    if (!this.isDescriptionValid) {
      this.snackBar.open('Description must contain at least 5 words', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    }
  }
}
