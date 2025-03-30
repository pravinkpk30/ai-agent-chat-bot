import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { Message } from '../../interfaces/message.interface';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  template: `
    <div class="chat-wrapper">
      <div class="chat-container">
        <div class="messages" #messageContainer>
          <div *ngFor="let message of messages" 
               [ngClass]="{'message': true, 'user-message': message.sender === 'user', 'bot-message': message.sender === 'bot'}">
            <div class="message-content">
              <markdown *ngIf="message.sender === 'bot'" [data]="message.content"></markdown>
              <span *ngIf="message.sender === 'user'">{{ message.content }}</span>
            </div>
            <div class="message-timestamp">{{ message.timestamp | date:'short' }}</div>
          </div>
          
          <!-- Loading Skeleton -->
          <div *ngIf="isLoading" class="message bot-message skeleton-message">
            <div class="skeleton-content">
              <div class="skeleton-line"></div>
              <div class="skeleton-line"></div>
            </div>
          </div>
        </div>
        <div class="input-container">
          <input type="text" 
                 [(ngModel)]="newMessage" 
                 (keyup.enter)="sendMessage()"
                 placeholder="Type your message..."
                 [disabled]="isLoading"
                 class="message-input">
          <button (click)="sendMessage()" 
                  [disabled]="isLoading"
                  class="send-button">
            <span *ngIf="!isLoading">Send</span>
            <span *ngIf="isLoading" class="spinner"></span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f0f2f5;
      padding: 20px;
    }

    .chat-container {
      display: flex;
      flex-direction: column;
      height: 80vh;
      width: 100%;
      max-width: 800px;
      background-color: white;
      border-radius: 15px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 20px;
      padding: 10px;
    }

    .message {
      margin: 10px;
      padding: 12px 18px;
      border-radius: 15px;
      max-width: 70%;
      word-wrap: break-word;
      animation: fadeIn 0.3s ease-in-out;
    }

    .message-content {
      width: 100%;
    }

    .message-content ::ng-deep {
      /* Style markdown content */
      pre {
        background-color: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        overflow-x: auto;
      }

      code {
        background-color: #f8f9fa;
        padding: 0.2rem 0.4rem;
        border-radius: 4px;
        font-family: monospace;
      }

      ul, ol {
        margin: 0.5rem 0;
        padding-left: 1.5rem;
      }

      p {
        margin: 0.5rem 0;
      }

      h1, h2, h3, h4, h5, h6 {
        margin: 1rem 0 0.5rem 0;
      }

      table {
        border-collapse: collapse;
        width: 100%;
        margin: 1rem 0;
      }

      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }

      th {
        background-color: #f8f9fa;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .user-message {
      background-color: #0084ff;
      color: white;
      margin-left: auto;
    }

    .bot-message {
      background-color: #f0f2f5;
      color: black;
      margin-right: auto;
    }

    .message-timestamp {
      font-size: 0.75em;
      margin-top: 5px;
      opacity: 0.7;
    }

    .input-container {
      display: flex;
      gap: 12px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 12px;
    }

    .message-input {
      flex: 1;
      padding: 12px;
      border: 1px solid #e4e6eb;
      border-radius: 8px;
      outline: none;
      font-size: 1rem;
      transition: border-color 0.2s;
    }

    .message-input:focus {
      border-color: #0084ff;
    }

    .send-button {
      padding: 12px 24px;
      background-color: #0084ff;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 80px;
    }

    .send-button:hover:not(:disabled) {
      background-color: #0073e6;
      transform: translateY(-1px);
    }

    .send-button:disabled {
      background-color: #e4e6eb;
      cursor: not-allowed;
    }

    /* Spinner Animation */
    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Skeleton Loading */
    .skeleton-message {
      background-color: #f0f2f5;
      animation: pulse 1.5s infinite;
    }

    .skeleton-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-line {
      height: 12px;
      background-color: #e4e6eb;
      border-radius: 4px;
    }

    .skeleton-line:first-child {
      width: 80%;
    }

    .skeleton-line:last-child {
      width: 60%;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
  `]
})
export class ChatComponent implements OnInit {
  messages: Message[] = [];
  newMessage = '';
  isLoading = false;
  @ViewChild('messageContainer') private messageContainer!: ElementRef;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.chatService.messages$.subscribe(messages => {
      this.messages = messages;
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  sendMessage() {
    if (this.newMessage.trim() && !this.isLoading) {
      this.isLoading = true;
      
      this.chatService.sendMessage(this.newMessage)
        .subscribe({
          next: (response) => {
            console.log("Received response from n8n:", response);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error sending message:', error);
            this.chatService.addBotMessage({ message: 'Sorry, there was an error processing your message.' });
            this.isLoading = false;
          }
        });
      this.newMessage = '';
    }
  }

  private scrollToBottom() {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
