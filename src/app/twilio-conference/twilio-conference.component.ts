import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TwilioVideoService } from '../core/services/twilio-video.service';
declare const joinRoom: any;
declare const participantConnectedJs: any;

@Component({
  selector: 'app-twilio-conference',
  templateUrl: './twilio-conference.component.html',
  styleUrls: ['./twilio-conference.component.css']
})
export class TwilioConferenceComponent implements OnInit {
  remoteVideo!: ElementRef;
  localVideo!: ElementRef;
  constructor(public router: Router, public element: ElementRef, public twilioService: TwilioVideoService) {
    this.routerData = this.router.getCurrentNavigation()?.extras.state;
  }


  showParticipants = false;
  showChat = false;
  routerData: any;
  room: any;
  allParticipants: any = [];
  messageInput: any;
  requiredMsg: any = [];

  async ngOnInit(): Promise<void> {
    this.room = await joinRoom(this.routerData);
    this.participantsFilter();
    this.participantConnected(this.room.localParticipant);
    this.room.participants.forEach(this.participantConnected);
    this.room.on("participantConnected", this.participantConnected);

    this.room.on("participantDisconnected", this.participantDisconnected);
    this.room.once("disconnected", (error: any) => this.room.participants.forEach(this.participantDisconnected));
  }

  participantConnected(participant: any) {
    let participants: any = document.getElementById("participants");

    const e1 = document.createElement('div');
    e1.setAttribute("id", participant.sid)
    participants.appendChild(e1);
    console.log(participant);
    participant.tracks.forEach((publication: any) => {
      const trackSubscribed = (track: any) => {
        if (track.kind === 'data') {
          track.on('message', (data: any) => {
            let dataRecieved = JSON.parse(data);
            dataRecieved.status = "recieve-msg";
            console.log(data);
            // this.requiredMsg.push(dataRecieved);
            this.name(data);
          });
        }
        if (track.kind === 'audio' || track.kind === 'video') {
          console.log(track);
          // this.element.nativeElement.querySelector(`#${participant.sid}`).appendChild(track.attach());
        }
      };
      if (publication.track) {
        trackSubscribed(publication.track)
      };
      publication.on("subscribed", trackSubscribed);
    });
  };

 name(res: any) {
   console.log(res)
 }

  trackSubscribed(track: any) {
    console.log(track);
  }

  trackUnSubscribed(track: any) {
    console.log(track);
  }

  participantDisconnected(participant: any) {
    console.log(participant);
  }
  participantsFilter() {
    if (this.room) {
      this.allParticipants.push(this.room.localParticipant.identity);
      this.room.participants.forEach((element: any) => {
        this.allParticipants.push(element.identity);
      });
    }
  }

  async leaveCall() {
    await this.room.localParticipant.tracks.forEach((publication: { track: any; }) => {
      console.log('parr', publication);
      const track = publication.track;
      // stop releases the media element from the browser control
      // which is useful to turn off the camera light, etc.
      if (track.kind === 'video' || track.kind === 'audio') {
        track.stop();
        const elements = track.detach();
        elements.forEach((element: { remove: () => any; }) => element.remove());
      }
    });
    await this.room.disconnect();
    this.twilioService.isAuthenticate = false;
    this.router.navigateByUrl('/');
  }

  chatWindow() {

    this.showChat = (this.showChat) ? false : true;
    this.chatOrParticipantContainer();
  };

  participantsWindow() {
    this.showParticipants = (this.showParticipants) ? false : true;
    this.chatOrParticipantContainer();
  };

  chatOrParticipantContainer() {
    let videoContainer = this.element.nativeElement.querySelector('.video-container');

    if (this.showParticipants || this.showChat) {
      videoContainer.style.width = "calc(100% - 320px)";
      videoContainer.style.transition = "all 0.5s ease";
    } else {
      videoContainer.style.width = "100%";
      videoContainer.style.transition = "all 0.5s ease";
    };
  };
}
