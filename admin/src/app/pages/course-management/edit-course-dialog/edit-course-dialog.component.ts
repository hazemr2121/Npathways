import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoursesService, Course } from '../../../services/course.service';
import {
  InstructorService,
  Instructor,
} from '../../../services/instructor.service';

interface Lesson {
  name: string;
  duration: number;
  description?: string;
  downloadLink?: string;
  _id?: string;
}

interface ValidationErrors {
  name?: string;
  description?: string;
  price?: string;
  discount?: string;
  image?: string;
  instructors?: string;
  lessons?: {
    [key: number]: {
      name?: string;
      duration?: string;
      description?: string;
      downloadLink?: string;
    };
  };
}

@Component({
  selector: 'app-edit-course-dialog',
  templateUrl: './edit-course-dialog.component.html',
  styleUrls: ['./edit-course-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class EditCourseDialogComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() courseUpdated = new EventEmitter<void>();

  course: Course = {
    name: '',
    description: '',
    requiredExams: [],
    instructors: [],
    lessons: [],
    status: 'unpublished',
    price: 0,
    discount: 0,
    category: '',
  };

  showDialog = false;
  isSubmitting = false;
  error: string | null = null;
  imagePreview: string | null = null;
  courseImage: File | null = null;
  instructors: Instructor[] = [];
  selectedInstructors: string[] = [];
  newInstructor: string = '';
  validationErrors: ValidationErrors = {};

  constructor(
    private coursesService: CoursesService,
    private instructorService: InstructorService
  ) {}

  ngOnInit() {
    this.loadInstructors();
  }

  loadInstructors() {
    this.instructorService.getAllInstructors().subscribe({
      next: (instructors) => {
        this.instructors = instructors;
      },
      error: (error) => {
        console.error('Error loading instructors:', error);
        this.error = 'Failed to load instructors. Please try again.';
      },
    });
  }

  getInstructorName(instructorId: string): string {
    const instructor = this.instructors.find((i) => i._id === instructorId);
    return instructor ? `${instructor.firstName} ${instructor.lastName}` : '';
  }

  getAvailableInstructors(): Instructor[] {
    return this.instructors.filter(
      (instructor) =>
        instructor._id && !this.selectedInstructors.includes(instructor._id)
    );
  }

  addInstructor() {
    if (
      this.newInstructor &&
      !this.selectedInstructors.includes(this.newInstructor)
    ) {
      this.selectedInstructors.push(this.newInstructor);
      this.newInstructor = '';
    }
  }

  removeInstructor(instructorId: string) {
    this.selectedInstructors = this.selectedInstructors.filter(
      (id) => id !== instructorId
    );
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        this.validationErrors.image =
          'Please select a valid image file (PNG, JPEG, JPG, or WEBP)';
        input.value = ''; // Clear the input
        this.imagePreview = null;
        this.courseImage = null;
        return;
      }

      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.validationErrors.image = 'Image size should be less than 5MB';
        input.value = ''; // Clear the input
        this.imagePreview = null;
        this.courseImage = null;
        return;
      }

      this.courseImage = file;
      this.validationErrors.image = undefined;

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.courseImage);
    }
  }

  addLesson() {
    this.course.lessons.push({
      name: '',
      duration: 30,
      description: '',
      downloadLink: '',
    });
  }

  removeLesson(index: number) {
    this.course.lessons.splice(index, 1);
  }

  validateForm(): boolean {
    this.validationErrors = {};
    let isValid = true;

    // Validate course name
    if (!this.course.name.trim()) {
      this.validationErrors.name = 'Course name is required';
      isValid = false;
    } else if (this.course.name.trim().length < 3) {
      this.validationErrors.name =
        'Course name must be at least 3 characters long';
      isValid = false;
    }

    // Validate description
    if (!this.course.description.trim()) {
      this.validationErrors.description = 'Course description is required';
      isValid = false;
    } else if (this.course.description.trim().length < 10) {
      this.validationErrors.description =
        'Description must be at least 10 characters long';
      isValid = false;
    }

    // Validate lessons
    if (this.course.lessons.length === 0) {
      this.validationErrors.lessons = {
        0: { name: 'At least one lesson is required' },
      };
      isValid = false;
    } else {
      this.course.lessons.forEach((lesson, index) => {
        this.validationErrors.lessons = this.validationErrors.lessons || {};
        this.validationErrors.lessons[index] =
          this.validationErrors.lessons[index] || {};

        // Validate lesson name
        if (!lesson.name.trim()) {
          this.validationErrors.lessons[index].name = 'Lesson name is required';
          isValid = false;
        } else if (lesson.name.trim().length < 2) {
          this.validationErrors.lessons[index].name =
            'Lesson name must be at least 2 characters long';
          isValid = false;
        }

        // Validate duration
        if ((lesson?.duration ?? 0) <= 0) {
          this.validationErrors.lessons[index].duration =
            'Duration must be greater than 0';
          isValid = false;
        }

        // Validate description
        if (!lesson.description || !lesson.description.trim()) {
          this.validationErrors.lessons[index].description =
            'Lesson description is required';
          isValid = false;
        } else if (lesson.description.trim().length < 5) {
          this.validationErrors.lessons[index].description =
            'Lesson description must be at least 5 characters long';
          isValid = false;
        }

        // Validate download link
        const downloadLinkPattern = /^https?:\/\/.+/;
        if (!lesson.downloadLink || !lesson.downloadLink.trim()) {
          this.validationErrors.lessons[index].downloadLink =
            'Download link is required';
          isValid = false;
        } else if (!downloadLinkPattern.test(lesson.downloadLink.trim())) {
          this.validationErrors.lessons[index].downloadLink =
            'Download link must be a valid URL (http/https)';
          isValid = false;
        }
      });
    }

    return isValid;
  }

  openDialog(course: Course) {
    this.course = { ...course };
    this.imagePreview = course.image || null;
    this.selectedInstructors = course.instructors
      .map((instructor) =>
        typeof instructor === 'string' ? instructor : instructor._id || ''
      )
      .filter(Boolean);
    this.showDialog = true;
    this.error = null;
    this.validationErrors = {};
  }

  async updateCourse() {
    if (!this.validateForm()) {
      return;
    }

    if (!this.course._id) {
      this.error = 'Course ID is missing';
      return;
    }

    try {
      this.isSubmitting = true;
      this.error = null;

      const formData = new FormData();
      formData.append('name', this.course.name.trim());
      formData.append('description', this.course.description.trim());
      formData.append('status', this.course.status || 'unpublished');

      if (this.courseImage) {
        formData.append('image', this.courseImage);
      }

      if (this.course.price !== undefined) {
        formData.append('price', this.course.price.toString());
      }

      if (this.course.discount !== undefined) {
        formData.append('discount', this.course.discount.toString());
      }

      if (this.course.category) {
        formData.append('category', this.course.category);
      }

      // Add instructors
      formData.append('instructors', JSON.stringify(this.selectedInstructors));

      // Add lessons - only include name and duration
      const validLessons = this.course.lessons
        .filter((lesson) => lesson.name.trim())
        .map((lesson) => ({
          name: lesson.name.trim(),
          duration: lesson.duration,
          description: lesson.description?.trim() || '',
          downloadLink: lesson.downloadLink?.trim() || '',
        }));

      formData.append('lessons', JSON.stringify(validLessons));

      await this.coursesService
        .updateCourse(this.course._id, formData)
        .toPromise();
      this.courseUpdated.emit();
      this.closeDialog();
    } catch (error: any) {
      console.error('Error updating course:', error);
      this.error =
        error.error?.message || 'Failed to update course. Please try again.';
    } finally {
      this.isSubmitting = false;
    }
  }

  closeDialog() {
    this.showDialog = false;
    this.close.emit();
    this.resetForm();
  }

  private resetForm() {
    this.course = {
      name: '',
      description: '',
      requiredExams: [],
      instructors: [],
      lessons: [],
      status: 'unpublished',
      price: 0,
      discount: 0,
      category: '',
    };
    this.selectedInstructors = [];
    this.newInstructor = '';
    this.courseImage = null;
    this.imagePreview = null;
    this.error = null;
    this.validationErrors = {};
    this.isSubmitting = false;
  }
}
