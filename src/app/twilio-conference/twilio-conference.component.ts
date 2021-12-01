import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarEventService } from '../core/services/calendar-event.service';
import { TwilioVideoService } from '../core/services/twilio-video.service';
declare const joinRoom: any;
declare const callendarEvent: any;
declare const captureScreen: any;

@Component({
  selector: 'app-twilio-conference',
  templateUrl: './twilio-conference.component.html',
  styleUrls: ['./twilio-conference.component.css']
})
export class TwilioConferenceComponent implements OnInit {

  constructor(public router: Router, public element: ElementRef, public twilioService: TwilioVideoService, public calendarEventService: CalendarEventService) {
    this.routerData = this.router.getCurrentNavigation()?.extras.state;
  }

  showParticipants = false;
  showChat = false;
  screenShareContainer = false;
  muteContainer = false;
  localContainer = false;
  routerData: any;
  room: any;
  allParticipants: any = [];
  messageInput: any;

  async ngOnInit(): Promise<void> {
    this.room = await joinRoom(this.routerData);
    if (this.room == "NoRoom") this.router.navigateByUrl('/');
    if (this.room.participants.size == 0) this.localContainer = true;
  }

  async leaveCall() {
    await this.room.localParticipant.tracks.forEach((publication: { track: any; }) => {
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
    if (this.room && this.room.participants && (this.room.participants.size == 0)) {
      callendarEvent(this.room.localParticipant, 2);
    }
    this.twilioService.isAuthenticate = false;
    this.router.navigateByUrl('/');
  }


  chatWindow() {

    this.showChat = (this.showChat) ? false : true;
    // this.chatOrParticipantContainer();
  };

  participantsWindow() {
    this.showParticipants = (this.showParticipants) ? false : true;
    // this.chatOrParticipantContainer();
  };

  chatOrParticipantContainer() {
    let videoContainer = this.element.nativeElement.querySelector('.my-video');

    if (this.showParticipants || this.showChat) {
      // videoContainer.style.width = "calc(100% - 320px)";
      videoContainer.style.transition = "all 0.5s ease";
    } else {
      videoContainer.style.width = "100%";
      // videoContainer.style.transition = "all 0.5s ease";
    };
  };

  async shareScreen() {
    console.log("screen share");
    this.screenShareContainer = (this.screenShareContainer) ? false : true;
    if (this.screenShareContainer) {
      await captureScreen();
    }
  }

  async muteAction() {
    this.muteContainer = (this.muteContainer) ? false : true;
    if(this.muteContainer) {
      this.room.localParticipant.audioTracks.forEach((publication:any) => {
        publication.track.disable();
      });
    } else {
      this.room.localParticipant.audioTracks.forEach((publication:any) => {
        publication.track.enable();
      });
    }
    
  }
}
