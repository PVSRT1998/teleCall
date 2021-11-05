import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
declare const twilioVideo: any;
declare const joinRoom: any;
declare const chatClientCreate: any;
declare const room: any;

@Component({
  selector: 'app-twilio-conference',
  templateUrl: './twilio-conference.component.html',
  styleUrls: ['./twilio-conference.component.css']
})
export class TwilioConferenceComponent implements OnInit {
  @ViewChild('video', { static: true }) video: ElementRef<HTMLVideoElement> | undefined;

  routerData: any;
  constructor(public router: Router) {
    console.log(this.router.getCurrentNavigation()?.extras.state);
    this.routerData = this.router.getCurrentNavigation()?.extras.state;
   }

  chatTrack: boolean = false;
  showParticipants = false;
  showChat = false;
  // localTracks: any;
  ngOnInit(): void {
    // twilioVideo();
    // this.testClick();
    joinRoom(this.routerData);
    // chatClientCreate(this.routerData);
  }

  chatWindow() {
    this.showParticipants = false;
    this.showChat = (this.showChat)? false : true;
  };

  async leaveCall() {
      await room.localParticipant.tracks.forEach((publication: { track: any; }) => {
          console.log('parr', publication);
          const track = publication.track;
          // stop releases the media element from the browser control
          // which is useful to turn off the camera light, etc.
          track.stop();
          const elements = track.detach();
          elements.forEach((element: { remove: () => any; }) => element.remove());
      });
      await room.disconnect();
      this.router.navigateByUrl('/');
  }

  participantsWindow() {
    this.showChat = false;
    this.showParticipants = (this.showParticipants)? false : true;
  };

  async testClick() {
    let localTracks = new Array(await twilioVideo());
    console.log(localTracks);
    let videoTrack = localTracks.forEach(element => {
      
    });
    // console.log(videoTrack);
    // this.video?.nativeElement.appendChild(this.videoTrack.attach());
  }

  participantsBlock() {
    this.chatTrack = false;
  }

  chatBlock() {
    this.chatTrack = true;
  }
}
