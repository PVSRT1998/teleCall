let room;
let Video = Twilio.Video;

async function joinRoom(responseData) {

    let roomName = await responseData.room;
    let token = await responseData.token;

    // let roomName = "abc-123-456";
    // let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJpc3MiOiJTS2VmNTU0ZjBhMDhkYzU5YmNmNDA0ZmZlODRiY2M2YWYzIiwiZXhwIjoxNjM2NTY4Mjc0LCJqdGkiOiJTS2VmNTU0ZjBhMDhkYzU5YmNmNDA0ZmZlODRiY2M2YWYzLTE2MzY1NjQ2NzQiLCJzdWIiOiJBQzE3NDg5YjdjOTVmMmNjNWYzZTMyNTY5OWQ4MmVlNGUyIiwiZ3JhbnRzIjp7ImlkZW50aXR5IjoiZ2FqamFAZ21haWwuY29tIiwidmlkZW8iOnsicm9vbSI6ImFiYzIzNC00NTY3OC00MzIzNDUifX19.T5mYbitXjwtRkXul5VrYhuLiaZWxBUA8ZOuqcbDbgWg";

    let requiredRoom = await startVideoChat(roomName, token);
    return requiredRoom;

};

async function startVideoChat(roomName, token) {
    var roomSpan = document.getElementById("room");

    room = await Video.connect(token, {
        room: roomName,
        video: { width: 720 },
        audio: true,
        bandwidthProfile: {
            video: {
                mode: 'collaboration',
                dominantSpeakerPriority: 'high'
            }
        },
        dominantSpeaker: true,
        preferredVideoCodecs: [{ codec: 'VP8', simulcast: true }],
        networkQuality: { local: 1, remote: 1 }
    });
    participantConnected(room.localParticipant);
    room.participants.forEach(participantConnected);

    // subscribe to new participant joining event so we can display their video/audio
    room.on("participantConnected", participantConnected);

    room.on("participantDisconnected", participantDisconnected);
    window.addEventListener("beforeunload", tidyUp(room));
    window.addEventListener("pagehide", tidyUp(room));

    return room;
}

function participantConnected(participant) {
    console.log('Participant connected', participant);
    let participants = document.getElementById("participants");

    const e1 = document.createElement('div');
    e1.setAttribute("id", participant.sid)
    participants.appendChild(e1);

    participant.tracks.forEach(publication => {
        trackPublished(publication, participant);
    });

    participant.on('trackPublished', trackPublished)
}

function participantDisconnected(participant) {
    participant.removeAllListeners();
    const el = document.getElementById(participant.sid);
    el.remove();
}

function trackPublished(trackPublication, participant) {
    const e1 = document.getElementById(participant.sid);
    const trackSubscribed = (track) => {
        e1.appendChild(track.attach());
    };
    if (trackPublication.track) {
        trackSubscribed(trackPublication.track)
    };
    trackPublication.on("subscribed", trackSubscribed);
}

function tidyUp(room) {
    return function(event) {
        if (event.persisted) {
            return;
        }
        if (room) {
            room.disconnect();
            room = null;
        }
    };
};