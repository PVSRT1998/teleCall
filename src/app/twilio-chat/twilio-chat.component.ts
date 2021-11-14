import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';
declare const setSenderMsg: any;
declare const receiveMsg: any;

@Component({
  selector: 'app-twilio-chat',
  templateUrl: './twilio-chat.component.html',
  styleUrls: ['./twilio-chat.component.css']
})
export class TwilioChatComponent implements OnInit {
@Input() recieve:any;
  constructor() { }

  messageInput: any;
  // recieve = receiveMsg;
  
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
      await setSenderMsg(Sendermsg);
    }
  }
}
