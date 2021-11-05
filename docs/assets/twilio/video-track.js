let room;
console.log(Twilio);

let Video = Twilio.Video;

async function twilioVideo() {
    let createVideo = await new Promise((resolve, reject) => {
        Video.createLocalTracks({
                audio: true,
                video: { width: 1215 }
            })
            .then((track) => {
                resolve(track);
            })
            .catch((error) => {
                reject(error);
            })
    });

    return createVideo;
};

async function joinRoom(responseData) {

    let roomName = await responseData.room;
    let token = await responseData.token;

    startVideoChat(roomName, token);

};

async function startVideoChat(roomName, token) {
    var roomSpan = document.getElementById("room");

    console.log(roomSpan);
    room = await Video.connect(token, {
        room: roomName,
        video: { width: 1215 },
        audio: false,
    });
    participantConnected(room.localParticipant);
    room.participants.forEach(participantConnected);

    // subscribe to new participant joining event so we can display their video/audio
    room.on("participantConnected", participantConnected);

    room.on("participantDisconnected", participantDisconnected);
    window.addEventListener("beforeunload", tidyUp(room));
    window.addEventListener("pagehide", tidyUp(room));
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