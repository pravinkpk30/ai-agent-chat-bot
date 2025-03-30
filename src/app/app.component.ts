import { Component } from '@angular/core';
import { ChatComponent } from './components/chat/chat.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ChatComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>AI Chat Bot</h1>
      </header>
      <app-chat></app-chat>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background-color: #007bff;
      color: white;
      padding: 1rem;
      text-align: center;
    }

    .app-header h1 {
      margin: 0;
      font-size: 1.5rem;
    }
  `]
})
export class AppComponent {
  title = 'ai-agent-chat-bot';
}
