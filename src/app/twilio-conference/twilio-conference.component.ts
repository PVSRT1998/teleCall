import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CalendarEventService } from '../core/services/calendar-event.service';
import { TwilioVideoService } from '../core/services/twilio-video.service';
import { EndCallDialogComponent } from '../end-call-dialog/end-call-dialog.component';
declare const joinRoom: any;
declare const callendarEvent: any;
declare const captureScreen: any;

@Component({
  selector: 'app-twilio-conference',
  templateUrl: './twilio-conference.component.html',
  styleUrls: ['./twilio-conference.component.css']
})
export class TwilioConferenceComponent implements OnInit {

  constructor(public dialog: MatDialog ,public router: Router, public element: ElementRef, public twilioService: TwilioVideoService, public calendarEventService: CalendarEventService) {
    this.routerData = this.router.getCurrentNavigation()?.extras.state;
  }

  showParticipants = false;
  showChat = false;
  screenShareContainer = false;
  muteContainer = false;
  routerData: any;
  room: any;
  allParticipants: any = [];
  messageInput: any;

  async ngOnInit(): Promise<void> {
    this.room = await joinRoom(this.routerData);
    if (this.room == "NoRoom") this.router.navigateByUrl('/');
  }

  async leaveCall() {
    let dialogResult = this.dialog.open(EndCallDialogComponent, {
      width: '320px'
    });
    dialogResult.afterClosed().subscribe(result => {
      if (!result) return;
      if (result && !result.event) return;
      if (result && result.event) this.endCall();
    })
    
  }

  async endCall() {
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
  };

  participantsWindow() {
    this.showParticipants = (this.showParticipants) ? false : true;
  };

  async shareScreen() {
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
