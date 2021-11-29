import { Component, ElementRef, OnChanges, OnInit, SimpleChange } from '@angular/core';
declare const setSenderMsg: any;

@Component({
  selector: 'app-twilio-chat',
  templateUrl: './twilio-chat.component.html',
  styleUrls: ['./twilio-chat.component.css']
})
export class TwilioChatComponent implements OnInit {

  constructor(public element: ElementRef) { }

  messageInput: any;
  
  ngOnInit(): void {
  }

  async sendMessage(message: any) {
    this.messageInput = "";
    //  Creates a Local Data Track
    if (message) {
      let Sendermsg = {
        status: 'sender-msg',
        message: message,
        timeStamp: Date.now()
      };
      let sendParent = document.createElement('div');
      sendParent.classList.add('sender-div');
      let sendContainer = document.createElement('label');
      sendContainer.classList.add(Sendermsg.status);
      sendContainer.innerText = Sendermsg.message;
      sendParent.appendChild(sendContainer)
      this.element.nativeElement.querySelector('#chat-display').appendChild(sendParent);
      await setSenderMsg(Sendermsg);
    }
  }
}
