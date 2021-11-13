import { Component, OnInit } from '@angular/core';
declare const dataTrack: any;
declare const allMsgs: any;

@Component({
  selector: 'app-twilio-chat',
  templateUrl: './twilio-chat.component.html',
  styleUrls: ['./twilio-chat.component.css']
})
export class TwilioChatComponent implements OnInit {

  constructor() { }

  messageInput: any;
  allReqMsgs: any = [];

  ngOnInit(): void {
  }

  async sendMessage(message: any) {
    this.messageInput = "";
    //  Creates a Local Data Track
    if (message) {
      let msg = {
        status: 'sender-msg',
        message: message,
        timeStamp: Date.now()
      };
      this.allReqMsgs.push(msg);
      dataTrack.send(JSON.stringify(msg));
    }
  }
}
