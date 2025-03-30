import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Message } from '../interfaces/message.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messages = new BehaviorSubject<Message[]>([]);
  messages$ = this.messages.asObservable();
  
  // Replace this URL with your n8n webhook URL
  private n8nWebhookUrl = 'http://localhost:5678/webhook/ai-chat';

  constructor(private http: HttpClient) {}

  sendMessage(content: string): Observable<any> {
    const userMessage: Message = {
      content,
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message to messages list
    const currentMessages = this.messages.getValue();
    this.messages.next([...currentMessages, userMessage]);

    // Send message to n8n webhook
    return this.http.post(this.n8nWebhookUrl, {
      message: content,
      timestamp: new Date().toISOString()
    }).pipe(
      tap((response: any) => {
        console.log("Response from n8n:", response.message.message)
        if (response && response.message && response.message.message) {
          const botMessage: Message = {
            content: response.message.message,
            sender: 'bot',
            timestamp: new Date()
          };
          
          // Append bot response to messages
          const updatedMessages = this.messages.getValue();
          this.messages.next([...updatedMessages, botMessage]);
        }
      })
    );
  }

  addBotMessage(content: any) {
    console.log("Adding bot message:", content.message);
    const botMessage: Message = {
      content: content.message,
      sender: 'bot',
      timestamp: new Date()
    };

    const currentMessages = this.messages.getValue();
    this.messages.next([...currentMessages, botMessage]);
  }
}
