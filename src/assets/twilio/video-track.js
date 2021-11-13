let room;
let Video = Twilio.Video;

async function joinRoom(responseData) {

    let roomName = await responseData.room;
    let token = await responseData.token;

    let requiredRoom = await startVideoChat(roomName, token);
    return requiredRoom;
};

async function startVideoChat(roomName, token) {
    const localTracks = await Twilio.Video.createLocalTracks();
    let dataTrack = new Twilio.Video.LocalDataTrack();

    let allTracks = localTracks.concat(dataTrack);
    room = await Video.connect(token, {
        name: roomName,
        tracks: allTracks
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

    participant.on('trackPublished', trackPublished);
    participant.on('trackAdded', track => {
        console.log(`Participant "${participant.identity}" added ${track.kind} Track ${track.sid}`);
        if (track.kind === 'data') {
            track.on('message', data => {
                console.log(data);
            });
        }
    });
}

function participantDisconnected(participant) {
    participant.removeAllListeners();
    const el = document.getElementById(participant.sid);
    el.remove();
}

function trackPublished(trackPublication, participant) {
    const trackSubscribed = (track) => {
        if (track.kind === 'data') {
            console.log(track);

            track.on('message', data => {
                console.log(data);
            });
        } else {
            const e1 = document.getElementById(participant.sid);
            e1.appendChild(track.attach());
        }
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

function getLocalDataTrack(message) {
    // Creates a Local Data Track
    let localDataTrack = Video.LocalDataTrack();
    // Publishing the local Data Track to the Room
    room.localParticipant.publishTrack(localDataTrack);
    localDataTrack.send(message);
    let dataTrackSender = document.getElementById("data-track");
    let senderMessage = document.createElement("div");
    senderMessage.innerText = message;
    dataTrackSender.appendChild(senderMessage);
}