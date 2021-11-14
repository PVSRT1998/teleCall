import { Injectable, ElementRef, Renderer2, RendererFactory2 } from ‘@angular/core’;
import { Observable } from ‘rxjs / Observable’;
import { connect } from ‘twilio - video’;
import { BehaviorSubject } from ‘rxjs / BehaviorSubject’;
import { Http } from ‘@angular/http’;
import { Router } from ‘@angular/router’;
@Injectable()
export class TwilioService {
    remoteVideo: ElementRef;
    localVideo: ElementRef;
    previewing: boolean;
    msgSubject = new BehaviorSubject(“”);
    roomObj: any;
    microphone = true;
    roomParticipants;
    private renderer: Renderer2;
    constructor(
        private http: Http,
        private router: Router,
        private rendererFactory: RendererFactory2) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }
    getToken(username): Observable<any> {
        return this.http.post(‘/abc’, { uid: ‘ashish’ });
}
    mute() {
        this.roomObj.localParticipant.audioTracks.forEach(function (
            audioTrack
        ) {
            audioTrack.track.disable();
        });
        this.microphone = false;
    }
    unmute() {
        this.roomObj.localParticipant.audioTracks.forEach(function (
            audioTrack
        ) {
            audioTrack.track.enable();
        });
        this.microphone = true;
    }
    connectToRoom(accessToken: string, options): void {
        connect(accessToken, options).then(room => {
            this.roomObj = room;
            if (!this.previewing && options[‘video’]) {
            this.startLocalVideo();
            this.previewing = true;
        }
        this.roomParticipants = room.participants;
        room.participants.forEach(participant => {
            this.attachParticipantTracks(participant);
        });
        room.on(‘participantDisconnected’, (participant) => {
            this.detachTracks(participant);
        });
        room.on(‘participantConnected’, (participant) => {
            this.roomParticipants = room.participants;
            this.attachParticipantTracks(participant);
            participant.on(‘trackPublished’, track => {
                const element = track.attach();
                this.renderer.data.id = track.sid;
                this.renderer.setStyle(element, ‘height’, ‘100 %’);
                this.renderer.setStyle(element, ‘max - width’, ‘100 %’);
                this.renderer.appendChild(this.remoteVideo.nativeElement, element);
            });
        });
        // When a Participant adds a Track, attach it to the DOM.
        room.on(‘trackPublished’, (track, participant) => {
            this.attachTracks([track]);
        });
        // When a Participant removes a Track, detach it from the DOM.
        room.on(‘trackRemoved’, (track, participant) => {
            this.detachTracks([track]);
        });
        room.once(‘disconnected’, room => {
            room.localParticipant.tracks.forEach(track => {
                track.track.stop();
                const attachedElements = track.track.detach();
                attachedElements.forEach(element => element.remove());
                room.localParticipant.videoTracks.forEach(video => {
                    const trackConst = [video][0].track;
                    trackConst.stop(); // <- error
                    trackConst.detach().forEach(element => element.remove());
                    room.localParticipant.unpublishTrack(trackConst);
                });
                let element = this.remoteVideo.nativeElement;
                while (element.firstChild) {
                    element.removeChild(element.firstChild);
                }
                let localElement = this.localVideo.nativeElement;
                while (localElement.firstChild) {
                    localElement.removeChild(localElement.firstChild);
                }
                this.router.navigate([‘thanks’]);
            });
        });
    }, (error) => {
        alert(error.message);
    });}
attachParticipantTracks(participant): void {
    participant.tracks.forEach(part => {
        this.trackPublished(part);
    });
}
trackPublished(publication) {
    if (publication.isSubscribed)
        this.attachTracks(publication.track);
    if (!publication.isSubscribed)
        publication.on(‘subscribed’, track => {
            this.attachTracks(track);
        });
}
attachTracks(tracks) {
    const element = tracks.attach();
    this.renderer.data.id = tracks.sid;
    this.renderer.setStyle(element, ‘height’, ‘100 %’);
    this.renderer.setStyle(element, ‘max - width’, ‘100 %’);
    this.renderer.appendChild(this.remoteVideo.nativeElement, element);
}
startLocalVideo(): void {
    this.roomObj.localParticipant.videoTracks.forEach(publication => {
        const element = publication.track.attach();
        this.renderer.data.id = publication.track.sid;
        this.renderer.setStyle(element, ‘width’, ‘25 %’);
        this.renderer.appendChild(this.localVideo.nativeElement, element);
    })
}
detachTracks(tracks): void {
    tracks.tracks.forEach(track => {
        let element = this.remoteVideo.nativeElement;
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    });
}}