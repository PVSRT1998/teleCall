import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarEventService } from '../core/services/calendar-event.service';
import { TwilioVideoService } from '../core/services/twilio-video.service';
declare const joinRoom: any;
declare const snackBar: any;
// declare const trackPublished: any;

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
  routerData: any;
  room: any;
  allParticipants: any = [];
  messageInput: any;

  async ngOnInit(): Promise<void> {
    this.room = await joinRoom(this.routerData);
    await this.connections();
    // this.calendarEvent(1);
  }

  connections() {
    this.participantConnected(this.room.localParticipant);
    this.room.participants.forEach(this.participantConnected);

    // subscribe to new participant joining event so we can display their video/audio
    this.room.on("participantConnected", this.participantConnected);

    this.room.on("participantDisconnected", this.participantDisconnected);
    // window.addEventListener("beforeunload", tidyUp(room));
    // window.addEventListener("pagehide", tidyUp(room));
  }

  calendarEventWhileParticipant(participant: any, EventNumber: Number) {
    let eventData = {
      EventId: this.routerData.room,
      ParticipantId: participant.identity,
      ActivityType: EventNumber
    };
    this.calendarEventService.calendarEvent(eventData).subscribe((data) => {
      console.log(data);
    })
  }
  participantConnected(participant: any) {
    console.log('Participant connected', participant);
    snackBar(participant, "Joined");
    if (this.room && this.room.participants && (this.room.participants.size == 0)) {
      this.calendarEventWhileParticipant(participant, 1);
    } else {
      this.calendarEventWhileParticipant(participant, 3);
    }
    let participants = this.element.nativeElement.querySelector("#participants");

    const e1 = document.createElement('div');
    e1.setAttribute("id", participant.sid)
    participants.appendChild(e1);

    participant.tracks.forEach((publication: any) => {
      this.trackPublished(publication, participant);
    });

    participant.on('trackPublished', this.trackPublished);

  }
  participantDisconnected(participant: any) {
    snackBar(participant, "Left");
    this.calendarEventWhileParticipant(participant, 4);
    participant.removeAllListeners();
    const el = this.element.nativeElement.querySelector(`#${participant.sid}`);
    el.remove();
  }
  calendarEvent(EventNumber: Number) {

    if (this.room && this.room.participants && (this.room.participants.size == 0)) {
      let eventData = {
        EventId: this.routerData.room,
        ParticipantId: this.room.localParticipant.identity,
        ActivityType: EventNumber
      };
      this.calendarEventService.calendarEvent(eventData).subscribe((data) => {
        console.log(data);
      })
    }

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
    await this.calendarEvent(2);
    this.twilioService.isAuthenticate = false;
    this.router.navigateByUrl('/');
  }

  trackPublished(trackPublication: any, participant: any) {
    const trackSubscribed = (track: any) => {
      if (track.kind === 'data') {
        track.on('message', (data: any) => {
          let dataRecieved = JSON.parse(data);
          dataRecieved.status = "recieve-msg";
          let recieveContainer = document.createElement('p');
          recieveContainer.classList.add(dataRecieved.status);
          recieveContainer.innerText = dataRecieved.message;
          this.element.nativeElement.querySelector(`#chat-display`).appendChild(recieveContainer);
          // document.getElementById('chat-display').appendChild(recieveContainer);
        });
      }
      if (track.kind === 'audio' || track.kind === 'video') {
        const e1 = this.element.nativeElement.querySelector(`#${participant.sid}`);
        e1.appendChild(track.attach());
      }
    };
    if (trackPublication.track) {
      trackSubscribed(trackPublication.track)
    };
    trackPublication.on("subscribed", trackSubscribed);
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
