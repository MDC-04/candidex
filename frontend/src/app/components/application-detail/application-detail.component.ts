import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApplicationService } from '../../services/application.service';
import { AuthService } from '../../services/auth.service';
import { Application, Note, Reminder } from '../../models/application.model';

@Component({
  selector: 'app-application-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './application-detail.component.html',
  styleUrls: ['./application-detail.component.css']
})
export class ApplicationDetailComponent implements OnInit {
  application: Application | null = null;
  isLoading = true;
  newNote = '';
  newReminder: Reminder = {
    title: '',
    description: '',
    dueDate: new Date(),
    completed: false
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadApplication(id);
    }
  }

  loadApplication(id: string): void {
    this.isLoading = true;
    this.applicationService.getApplicationById(id).subscribe({
      next: (application) => {
        this.application = application;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading application:', error);
        this.isLoading = false;
        this.router.navigate(['/applications']);
      }
    });
  }

  addNote(): void {
    if (this.application?.id && this.newNote.trim()) {
      const note: Note = {
        content: this.newNote,
        createdAt: new Date()
      };
      
      this.applicationService.addNote(this.application.id, note).subscribe({
        next: (updated) => {
          this.application = updated;
          this.newNote = '';
        },
        error: (error) => console.error('Error adding note:', error)
      });
    }
  }

  deleteNote(noteId: string | undefined): void {
    if (this.application?.id && noteId) {
      this.applicationService.deleteNote(this.application.id, noteId).subscribe({
        next: (updated) => {
          this.application = updated;
        },
        error: (error) => console.error('Error deleting note:', error)
      });
    }
  }

  addReminder(): void {
    if (this.application?.id && this.newReminder.title.trim()) {
      this.applicationService.addReminder(this.application.id, this.newReminder).subscribe({
        next: (updated) => {
          this.application = updated;
          this.newReminder = {
            title: '',
            description: '',
            dueDate: new Date(),
            completed: false
          };
        },
        error: (error) => console.error('Error adding reminder:', error)
      });
    }
  }

  toggleReminder(reminder: Reminder): void {
    if (this.application?.id && reminder.id) {
      const updated = { ...reminder, completed: !reminder.completed };
      this.applicationService.updateReminder(this.application.id, reminder.id, updated).subscribe({
        next: (app) => {
          this.application = app;
        },
        error: (error) => console.error('Error updating reminder:', error)
      });
    }
  }

  deleteReminder(reminderId: string | undefined): void {
    if (this.application?.id && reminderId) {
      this.applicationService.deleteReminder(this.application.id, reminderId).subscribe({
        next: (updated) => {
          this.application = updated;
        },
        error: (error) => console.error('Error deleting reminder:', error)
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/applications']);
  }

  logout(): void {
    this.authService.logout();
  }
}
