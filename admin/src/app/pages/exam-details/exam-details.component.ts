import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ExamService, Exam } from '../../services/exam.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Component({
  selector: 'app-exam-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  templateUrl: './exam-details.component.html',
  styleUrl: './exam-details.component.css',
})
export class ExamDetailsComponent implements OnInit {
  examId: string = '';
  exam: Exam | null = null;
  examForm: FormGroup;
  isEditing: boolean = false;
  difficulties = ['easy', 'medium', 'hard'];
  readonly MIN_ANSWERS = 2;
  readonly MAX_ANSWERS = 4;
  questionValidationErrors: { [key: number]: boolean } = {};
  answerValidationErrors: { [key: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examService: ExamService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.examForm = this.createExamForm();
  }

  ngOnInit(): void {
    this.examId = this.route.snapshot.params['id'];
    this.loadExamDetails();
  }

  private createExamForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      timeLimit: ['', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]*$')]],
      questions: this.fb.array([]),
    });
  }

  private createQuestionForm(): FormGroup {
    return this.fb.group({
      question: ['', [Validators.required, Validators.minLength(5)]],
      difficulty: ['medium', Validators.required],
      answers: this.fb.array([], [Validators.required, Validators.minLength(this.MIN_ANSWERS)]),
    });
  }

  private createAnswerForm(isCorrect: boolean = false): FormGroup {
    return this.fb.group({
      answer: ['', [Validators.required, Validators.minLength(1)]],
      isCorrect: [isCorrect],
    });
  }

  get questions(): FormArray {
    return this.examForm.get('questions') as FormArray;
  }

  getAnswers(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray;
  }

  loadExamDetails(): void {
    this.examService.getExamById(this.examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.patchFormWithExamData(exam);
      },
      error: (error) => {
        console.error('Error loading exam details:', error);
        this.showErrorNotification(
          'Error loading exam details. Please try again.'
        );
      },
    });
  }

  private patchFormWithExamData(exam: Exam): void {
    this.examForm.patchValue({
      name: exam.name,
      timeLimit: exam.timeLimit,
    });

    const questionsFormArray = this.examForm.get('questions') as FormArray;
    questionsFormArray.clear();

    exam.questions.forEach((question) => {
      const questionForm = this.createQuestionForm();
      questionForm.patchValue({
        question: question.question,
        difficulty: question.difficulty,
      });

      const answersFormArray = questionForm.get('answers') as FormArray;
      let hasSetCorrect = false;
      question.answers.forEach((answer) => {
        const isCorrect = !hasSetCorrect && answer.isCorrect;
        if (isCorrect) {
          hasSetCorrect = true;
        }
        answersFormArray.push(
          this.fb.group({
            answer: answer.answer,
            isCorrect: isCorrect,
          })
        );
      });

      if (!hasSetCorrect && answersFormArray.length > 0) {
        answersFormArray.at(0).get('isCorrect')?.setValue(true);
      }

      questionsFormArray.push(questionForm);
    });

    if (!this.isEditing) {
      this.disableFormControls();
    } else {
      this.enableFormControls();
    }
  }

  addQuestion(): void {
    const questionForm = this.createQuestionForm();
    const answersArray = questionForm.get('answers') as FormArray;
    answersArray.push(this.createAnswerForm(true));
    for (let i = 1; i < 3; i++) {
      answersArray.push(this.createAnswerForm(false));
    }
    this.questions.push(questionForm);
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  addAnswer(questionIndex: number): void {
    const answers = this.getAnswers(questionIndex);
    if (answers.length < this.MAX_ANSWERS) {
      answers.push(this.createAnswerForm(false));

      // Clear any validation errors for this question when adding a new answer
      this.questionValidationErrors[questionIndex] = false;
    }
  }

  removeAnswer(questionIndex: number, answerIndex: number): void {
    const answers = this.getAnswers(questionIndex);
    if (answers.length > this.MIN_ANSWERS) {
      answers.removeAt(answerIndex);
    } else {
      this.showErrorNotification(
        `Minimum ${this.MIN_ANSWERS} answers required per question.`
      );
    }
  }

  checkQuestionValidation(questionIndex: number): void {
    if (!this.isEditing) return;

    const answers = this.getAnswers(questionIndex);
    const correctAnswers = answers.controls.filter(
      (answer) => answer.get('isCorrect')?.value
    );

    this.questionValidationErrors[questionIndex] = correctAnswers.length !== 1;
  }

  setCorrectAnswer(questionIndex: number, answerIndex: number): void {
    const answers = this.getAnswers(questionIndex);
    answers.controls.forEach((answer, idx) => {
      if (idx === answerIndex) {
        answer.get('isCorrect')?.setValue(true);
      } else {
        answer.get('isCorrect')?.setValue(false);
      }
    });

    // Clear validation error when a correct answer is selected
    this.questionValidationErrors[questionIndex] = false;
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;

    if (!this.isEditing) {
      this.patchFormWithExamData(this.exam!);
    } else {
      this.enableFormControls();
      // Mark form as touched to trigger validation
      this.examForm.markAllAsTouched();
    }
  }

  private disableFormControls(): void {
    this.examForm.get('name')?.disable();
    this.examForm.get('timeLimit')?.disable();

    for (let i = 0; i < this.questions.length; i++) {
      const question = this.questions.at(i);
      question.get('question')?.disable();
      question.get('difficulty')?.disable();

      const answers = this.getAnswers(i);
      for (let j = 0; j < answers.length; j++) {
        answers.at(j).get('answer')?.disable();
        answers.at(j).get('isCorrect')?.disable();
      }
    }

    this.examForm.markAsUntouched();
  }

  private enableFormControls(): void {
    this.examForm.get('name')?.enable();
    this.examForm.get('timeLimit')?.enable();

    for (let i = 0; i < this.questions.length; i++) {
      const question = this.questions.at(i);
      question.get('question')?.enable();
      question.get('difficulty')?.enable();

      const answers = this.getAnswers(i);
      for (let j = 0; j < answers.length; j++) {
        answers.at(j).get('answer')?.enable();
        answers.at(j).get('isCorrect')?.enable();
      }
    }
  }

  checkAnswerValidation(questionIndex: number, answerIndex: number): void {
    if (!this.isEditing) return;

    const answer = this.getAnswers(questionIndex).at(answerIndex);
    const answerText = answer.get('answer')?.value;

    // Check if answer is empty or only whitespace
    this.answerValidationErrors[`${questionIndex}-${answerIndex}`] = !answerText || answerText.trim() === '';
  }

  validateAnswers(): boolean {
    let isValid = true;
    const questions = this.examForm.get('questions') as FormArray;

    for (let i = 0; i < questions.length; i++) {
      const answers = this.getAnswers(i);
      if (
        answers.length < this.MIN_ANSWERS ||
        answers.length > this.MAX_ANSWERS
      ) {
        this.showErrorNotification(
          `Question ${i + 1} must have between ${this.MIN_ANSWERS} and ${
            this.MAX_ANSWERS
          } answers.`
        );
        isValid = false;
        break;
      }

      // Check if the question has exactly one correct answer
      this.checkQuestionValidation(i);
      if (this.questionValidationErrors[i]) {
        this.showErrorNotification(
          `Question ${i + 1} must have exactly one correct answer.`
        );
        isValid = false;
        break;
      }

      // Check if all answers have text
      for (let j = 0; j < answers.length; j++) {
        this.checkAnswerValidation(i, j);
        if (this.answerValidationErrors[`${i}-${j}`]) {
          this.showErrorNotification(
            `Question ${i + 1}, Answer ${j + 1} cannot be empty.`
          );
          isValid = false;
          break;
        }
      }

      if (!isValid) break;
    }
    return isValid;
  }



  private showErrorNotification(message: string): void {
    const snackBarRef = this.snackBar.open(message, 'Close', {
      duration: 0,
      panelClass: ['error-snackbar', 'multiline-snackbar'],
      verticalPosition: 'top',
      horizontalPosition: 'right',
      politeness: 'assertive'
    });

    snackBarRef.onAction().subscribe(() => {
      snackBarRef.dismiss();
    });
  }

  // private showSuccessNotification(message: string): void {
  //   this.snackBar.open(message, 'Close', {
  //     duration: 3000,
  //     panelClass: ['success-snackbar'],
  //     verticalPosition: 'top',
  //     horizontalPosition: 'right',
  //   });
  // }

  saveExam(): void {
    if (this.examForm.valid && this.validateAnswers()) {
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        width: '400px',
        data: {
          title: 'Confirm Save',
          message: 'Are you sure you want to save these changes to the exam?',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.examService
            .updateExam(this.examId, this.examForm.value)
            .subscribe({
              next: (updatedExam) => {
                this.exam = updatedExam;
                this.isEditing = false;
                this.showSuccessNotification('Exam updated successfully!');
              },
              error: (error) => {
                console.error('Error updating exam:', error);
                this.showErrorNotification(
                  error.error?.message ||
                    'Error updating exam. Please try again.'
                );
              },
            });
        }
      });
    }
  }

  showSuccessNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
      verticalPosition: 'top',
      horizontalPosition: 'right',
    });
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && this.examId) {
      this.examService.uploadQuestionsSheet(file, this.examId).subscribe({
        next: (response: any) => {
          console.log('File uploaded successfully:', response);
          this.showSuccessNotification(
            'Questions sheet uploaded successfully!'
          );
          this.loadExamDetails();
        },
        error: (error: any) => {
          console.error('Error uploading file:', error);

          if (error.error?.errors) {
            // Format the error message with proper line breaks
            let formattedMessage = error.error.errors.split('\n').splice(0, 5).join('\n');
            if (error.error.errors.split('\n').length > 5) {
              formattedMessage += '\n...';
            }
            this.showErrorNotification(formattedMessage);
          } else {
            this.showErrorNotification(
              error.error?.message || 'Error uploading questions sheet. Please try again.'
            );
          }
        },
      });
    }
  }
}
