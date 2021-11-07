import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TwilioVideoService } from '../core/services/twilio-video.service';

declare const myTest: any;
@Component({
  selector: 'app-join-page',
  templateUrl: './join-page.component.html',
  styleUrls: ['./join-page.component.css']
})
export class JoinPageComponent implements OnInit {

  constructor(public router: Router, public twilioVideoService: TwilioVideoService) { }

  joinForm: any = {};
  internetActive: boolean | undefined;
  cameraActive: boolean | undefined;
  audioActive: boolean | undefined;
  allDevicesAllowed: boolean = false;
  ngOnInit() {
    this.connectDevices();
  }

  async connectDevices() {
    this.internetActive = navigator.onLine;
    let stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    if (stream) {
      this.cameraActive = (stream.getVideoTracks()) ? true : false;
      this.audioActive = (stream.getAudioTracks()) ? true : false;
      this.allDevicesAllowed = (this.internetActive && stream.getVideoTracks() && stream.getAudioTracks()) ? true : false;
    } else {
      this.audioActive = false;
      this.cameraActive = false;
      this.allDevicesAllowed = false;
    }
    await stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  joinMeet() {
    if (this.allDevicesAllowed) {
      this.twilioVideoService.getAccessToken({ identity: 'patient' }).subscribe((data) => {
        this.router.navigate(['twilio-conference'], {
          state: data
        });
      })
    } else {
      return alert("check you connections");
    }
  }

  submitBtnActive(event: any) {
    if (event && event.keyCode === 13 && event.key == 'Enter') {
      this.joinMeet();
    }
  }
}
