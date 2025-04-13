import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dialog-overlay" (click)="onCancel()">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h3>Confirm Delete</h3>
          <button class="close-button" (click)="onCancel()">×</button>
        </div>

        <div class="dialog-body">
          <div class="warning-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <p class="confirmation-message text-black">
            Are you sure you want to delete the pathway <strong>{{ pathwayName }}</strong>?
          </p>
          <p class="warning-message ">
            This action cannot be undone. All associated data will be permanently removed.
          </p>
        </div>

        <div class="dialog-actions">
          <button type="button" class="btn btn-danger" (click)="onConfirm()">Delete</button>
          <button type="button" class="btn btn-secondary" (click)="onCancel()">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .dialog-content {
      background: white;
      border-radius: 8px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid #eee;
    }

    .dialog-header h3 {
      margin: 0;
      color: #333;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }

    .dialog-body {
      padding: 1.5rem;
      text-align: center;
    }

    .warning-icon {
      font-size: 3rem;
      color: #dc3545;
      margin-bottom: 1rem;
    }

    .confirmation-message {
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .warning-message {
      color: #666;
      font-size: 0.9rem;
    }

    .dialog-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1rem;
      padding: 1rem;
      border-top: 1px solid #eee;
    }

    .btn {
      padding: 0.5rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-secondary {
      background-color: #e0e0e0;
      color: #333;
    }

    .btn:hover {
      opacity: 0.9;
    }
  `]
})
export class ConfirmDeleteDialogComponent {
  @Input() pathwayName: string = '';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
