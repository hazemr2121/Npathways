import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Enrollment } from '../enrollment.interface';
import { PathwayService } from '../../../services/pathway.service';

interface PathwayResponse {
  message: string;
  data: {
    _id: string;
    name: string;
    courses: any[];
    date: string;
    __v: number;
    description: string;
    updatedAt: string;
  };
}

@Component({
  selector: 'app-enrollment-details',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="close.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Enrollment Details</h2>
          <button class="close-btn" (click)="close.emit()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body" *ngIf="enrollment">
          <div class="section">
            <h3>Personal Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Name</label>
                <p>{{enrollment.firstName}} {{enrollment.lastName}}</p>
              </div>
              <div class="info-item">
                <label>Email</label>
                <p>{{enrollment.email}}</p>
              </div>
              <div class="info-item">
                <label>Phone</label>
                <p>{{enrollment.phone}}</p>
              </div>
              <div class="info-item">
                <label>Nationality</label>
                <p>{{enrollment.nationality}}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Address</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Country</label>
                <p>{{enrollment.address.country}}</p>
              </div>
              <div class="info-item">
                <label>City</label>
                <p>{{enrollment.address.city}}</p>
              </div>
              <div class="info-item">
                <label>Street</label>
                <p>{{enrollment.address.street}}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Academic Information</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Faculty</label>
                <p>{{enrollment.facultyName}}</p>
              </div>
              <div class="info-item">
                <label>GPA</label>
                <p>{{enrollment.GPA}}</p>
              </div>
              <div class="info-item">
                <label>Requested Pathway</label>
                <div class="pathway-approval">
                  <p>{{pathwayName || 'No Requested Pathway'}}</p>
                  <button
                    *ngIf="enrollment.pathway && !isApproved"
                    class="approve-btn"
                    (click)="approvePathway()"
                    [disabled]="isApproving">
                    {{isApproving ? 'Approving...' : 'Approve Pathway'}}
                  </button>
                  <span *ngIf="isApproved" class="approved-badge">Approved</span>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h3>Pathways</h3>
            <div class="pathways-list" *ngIf="enrollment.userId.pathways.length > 0; else noPathways">
              <div class="pathway-item" *ngFor="let pathway of enrollment.userId.pathways">
                <span class="pathway-name">{{pathway.name}}</span>
              </div>
            </div>
            <ng-template #noPathways>
              <p class="no-pathways">No pathways enrolled</p>
            </ng-template>
          </div>

          <div class="section">
            <h3>Motivation Letter</h3>
            <div class="motivation-letter text-black">
              <p>{{enrollment.motivationLetter}}</p>
            </div>
          </div>

          <div class="section">
            <h3>Exam Responses</h3>
            <div class="exam-responses">
              <div class="exam-item" *ngFor="let response of enrollment.exam">
                <h4>{{response.question}}</h4>
                <p>{{response.answer}}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
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

    .modal-content {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #E9EDF7;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      color: #1B2559;
      font-size: 1.5rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: #707EAE;
      cursor: pointer;
      font-size: 1.25rem;
      padding: 0.5rem;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .section {
      margin-bottom: 2rem;
    }

    .section h3 {
      color: #1B2559;
      margin-bottom: 1rem;
      font-size: 1.25rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-item label {
      color: #707EAE;
      font-size: 0.875rem;
    }

    .info-item p {
      color: #1B2559;
      margin: 0;
      font-weight: 500;
    }

    .pathways-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .pathway-item {
      background: #F8F9FF;
      padding: 0.75rem 1rem;
      border-radius: 8px;
    }

    .pathway-name {
      color: #4318FF;
      font-weight: 500;
    }

    .no-pathways {
      color: #707EAE;
      font-style: italic;
    }

    .motivation-letter {
      background: #F8F9FF;
      padding: 1rem;
      border-radius: 8px;
      white-space: pre-wrap;
    }

    .exam-responses {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .exam-item {
      background: #F8F9FF;
      padding: 1rem;
      border-radius: 8px;
    }

    .exam-item h4 {
      color: #1B2559;
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
    }

    .exam-item p {
      color: #707EAE;
      margin: 0;
    }

    .pathway-approval {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .approve-btn {
      background-color: #4318FF;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: background-color 0.2s;
    }

    .approve-btn:hover {
      background-color: #3311DB;
    }

    .approve-btn:disabled {
      background-color: #A3AED0;
      cursor: not-allowed;
    }

    .approved-badge {
      background-color: #05CD99;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
    }
  `]
})
export class EnrollmentDetailsComponent implements OnInit {
  @Input() enrollment: Enrollment | null = null;
  @Output() close = new EventEmitter<void>();
  pathwayName: string = '';
  isApproving: boolean = false;
  isApproved: boolean = false;

  constructor(private pathwayService: PathwayService) {}

  ngOnInit() {
    if (this.enrollment?.pathway) {
      this.loadPathwayName();
      this.checkApprovalStatus();
    }
  }

  private loadPathwayName() {
    if (this.enrollment?.pathway) {
      this.pathwayService.getPathwayById(this.enrollment.pathway).subscribe({
        next: (response: PathwayResponse) => {
          this.pathwayName = response.data.name;
        },
        error: (error: any) => {
          console.error('Error loading pathway:', error);
          this.pathwayName = 'Error loading pathway';
        }
      });
    }
  }

  private checkApprovalStatus() {
    if (this.enrollment?.userId.pathways) {
      this.isApproved = this.enrollment.userId.pathways.some(p => p._id === this.enrollment?.pathway);
    }
  }

  approvePathway() {
    if (!this.enrollment?.userId._id || !this.enrollment?.pathway) {
      return;
    }

    this.isApproving = true;
    this.pathwayService.enrollUserByAdmin( this.enrollment.pathway, this.enrollment.userId._id).subscribe({
      next: (response) => {
        this.isApproved = true;
        this.isApproving = false;
        // Refresh the enrollment data to show updated pathways
        if (this.enrollment) {
          this.enrollment.userId.pathways.push({
            _id: this.enrollment.pathway,
            name: this.pathwayName
          });
        }
      },
      error: (error) => {
        console.error('Error approving pathway:', error);
        this.isApproving = false;
      }
    });
  }
}
