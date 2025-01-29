import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Chatbot {
  id: string;
  name: string;
}

@Component({
  selector: 'app-chatbot-list',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterLink,RouterModule],
  templateUrl: './chatbot-list.component.html',
  styleUrls: ['./chatbot-list.component.css'],
})
export class ChatbotListComponent implements OnInit {
  chatbots: Chatbot[] = [];
  message: string = '';
  isSuccess: boolean = true;
  showModal: boolean = false;
  newChatbotName: string = '';
  showDeleteModal: boolean = false;
  chatbotToDeleteId: string | null = null;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.fetchChatbots();
  }

  fetchChatbots() {
    this.apiService.getChatbots().subscribe({
      next: (response) => {
        this.chatbots = response;
      },
      error: () => {
        this.showErrorMessage('Failed to fetch chatbots');
      },
    });
  }

  toggleModal() {
    this.showModal = !this.showModal;
    this.newChatbotName = '';
  }

  createChatbot() {
    if (this.newChatbotName.trim()) {
      this.apiService.createChatbot(this.newChatbotName).subscribe({
        next: () => {
          this.showSuccessMessage('Chatbot created successfully');
          this.fetchChatbots();
          this.toggleModal();
        },
        error: () => {
          this.showErrorMessage('Failed to create chatbot');
        },
      });
    } else {
      this.showErrorMessage('Chatbot name cannot be empty');
    }
  }


  deleteChatbot(chatbotId: string) {
    this.chatbotToDeleteId = chatbotId;
    this.showDeleteModal = true;
  }

  toggleDeleteModal(show: boolean) {
    // Toggles the modal visibility
    this.showDeleteModal = show;
    this.chatbotToDeleteId = null; 
  }

  confirmDelete() {
    
    if (this.chatbotToDeleteId) {
      this.apiService.deleteChatbot(this.chatbotToDeleteId).subscribe({
        next: () => {
          this.showSuccessMessage('Chatbot deleted successfully');
          this.fetchChatbots();
        },
        error: () => {
          this.showErrorMessage('Failed to delete chatbot');
        }
      });
    }
    this.showDeleteModal = false;
    this.chatbotToDeleteId = null;
  }

  logout1() {
    this.apiService.logout().subscribe(() => {
      console.log('Logged out successfully');
      this.router.navigate(['/']);
    });
  }

  private showSuccessMessage(message: string) {
    this.message = message;
    this.isSuccess = true;
    this.clearMessageAfterDelay();
  }

  private showErrorMessage(message: string) {
    this.message = message;
    this.isSuccess = false;
    this.clearMessageAfterDelay();
  }

  private clearMessageAfterDelay() {
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }
}
