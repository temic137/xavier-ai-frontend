import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

interface Escalation {
  id: string;
  chatbot_id: string;
  user_id: string;
  status: string;
  created_at: string;
}
@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-dashboard.component.html',
  styleUrl: './agent-dashboard.component.css'
})
export class AgentDashboardComponent implements OnInit {

  escalations: Escalation[] = [];
  selectedEscalation: Escalation | null = null;
  messages: any[] = [];
  newMessage: string = '';
  pollingSubscription: Subscription | null = null;

  apiUrl='http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchEscalations();
  }

  
  fetchEscalations(): void {
    this.http.get<Escalation[]>(`${this.apiUrl}/agent/escalations`).subscribe(
      (data) => {
        this.escalations = data;
      },
      (error) => {
        console.error('Error fetching escalations:', error);
      }
    );
  }

  // Select an escalation to view details
  selectEscalation(escalation: Escalation): void {
    this.selectedEscalation = escalation;
    this.startPolling(escalation.id);
  }

  // Start polling for messages
  startPolling(escalationId: string): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }

    this.pollingSubscription = interval(2000) 
      .pipe(
        switchMap(() =>
          this.http.get<any[]>(`${this.apiUrl}/escalation/${escalationId}/messages`)
        
        )
      )
      
      .subscribe(
        (data) => {
          this.messages = data;
        },
        (error) => {
          console.error('Error fetching messages:', error);
        }
      );
  }

  // Join an escalation
  joinEscalation(escalationId: string): void {
    this.http.post(`${this.apiUrl}/agent/escalation/${escalationId}/join`, {}).subscribe(
      () => {
        alert('Successfully joined the escalation!');
        this.fetchEscalations(); 
      },
      (error) => {
        console.error('Error joining escalation:', error);
      }
    );
  }

  // Send a message to the customer
  sendMessage(): void {
    if (!this.selectedEscalation || !this.newMessage) return;

    const payload = {
      message: this.newMessage,
      user_id: 'agent', 
    };

    this.http
      .post(`${this.apiUrl}/escalation/${this.selectedEscalation.id}/send`, payload)
      .subscribe(
        () => {
          this.newMessage = '';
          this.fetchMessages(this.selectedEscalation!.id); 
        },
        (error) => {
          console.error('Error sending message:', error);
        }
      );
  }

  // Fetch messages for a specific escalation
  fetchMessages(escalationId: string): void {
    this.http.get<any[]>(`${this.apiUrl}/escalation/${escalationId}/messages`).subscribe(
      (data) => {
        this.messages = data;
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
  }
}





