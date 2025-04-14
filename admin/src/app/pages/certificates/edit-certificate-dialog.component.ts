import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgModel } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Certificate } from '../../services/certificates.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
  selector: 'app-edit-certificate-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ],
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <span class="header-icon">✏️</span>
          Edit Certificate
        </h2>
      </div>

      <mat-dialog-content>
        <div class="form-group">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Certificate Name</mat-label>
            <input matInput [(ngModel)]="editName" required minlength="3" placeholder="Enter certificate name"
                   (blur)="validateNameOnBlur()">
            <span matPrefix class="input-icon">🏆</span>
            <mat-error *ngIf="!isNameValid">Certificate name must be at least 3 characters long</mat-error>
          </mat-form-field>
        </div>

        <div class="form-group">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput [(ngModel)]="editDescription" required rows="4" placeholder="Enter certificate description"
                      (blur)="validateDescriptionOnBlur()"></textarea>
            <span matPrefix class="input-icon my-0">📝</span>
            <mat-error *ngIf="!isDescriptionValid">Certificate description must contain at least 5 words</mat-error>
          </mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button (click)="onCancel()" class="cancel-button btn btn-danger">
          Cancel
        </button>
        <button (click)="onSave()" [disabled]="!isNameValid || !isDescriptionValid" class="save-button btn btn-success">
          Save Changes
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-container {
      padding: 0;
      border-radius: 8px;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f5f5f5;
      padding: 16px 24px;
      margin-bottom: 16px;
    }

    .header-icon {
      margin-right: 8px;
      font-size: 18px;
    }

    .close-button {
      color: #666;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .full-width {
      width: 100%;
    }

    .input-icon {
      margin-right: 8px;
      font-size: 16px;
    }

    mat-dialog-content {
      min-width: 450px;
      padding: 0 24px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
      margin: 0;
      background-color: #f5f5f5;
    }

    .cancel-button {
      margin-right: 8px;
    }

    .save-button {
      min-width: 120px;
    }

    ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      display: none;
    }
  `]
})
export class EditCertificateDialogComponent {
  editName: string;
  editDescription: string;
  isNameValid: boolean = true;
  isDescriptionValid: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<EditCertificateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      certificate: Certificate;
      editName: string;
      editDescription: string;
    },
    private snackBar: MatSnackBar
  ) {
    this.editName = data.editName;
    this.editDescription = data.editDescription;
  }

  validateNameOnBlur(): void {
    if (!this.editName) {
      this.isNameValid = true; // Don't show error if empty (required will handle that)
      return;
    }

    this.isNameValid = this.editName.length >= 3;

    if (!this.isNameValid) {
      this.snackBar.open('Certificate name must be at least 3 characters long', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar'],
        verticalPosition: 'top',
        horizontalPosition: 'right'
      });
    }
  }

  validateDescriptionOnBlur(): void {
    if (!this.editDescription) {
      this.isDescriptionValid = true; // Don't show error if empty (required will handle that)
      return;
    }

    const wordCount = this.editDescription.trim().split(/\s+/).length;
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

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // Validate before saving
    this.validateNameOnBlur();
    this.validateDescriptionOnBlur();

    if (!this.isNameValid || !this.isDescriptionValid) {
      return;
    }

    this.dialogRef.close({
      editName: this.editName,
      editDescription: this.editDescription
    });
  }
}
