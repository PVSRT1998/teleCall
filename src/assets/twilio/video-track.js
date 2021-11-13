let room;
let Video = Twilio.Video;
let dataTrack = new Twilio.Video.LocalDataTrack();
let receiveMsg = [];

async function joinRoom(responseData) {

    let roomName = await responseData.room;
    let token = await responseData.token;

    let requiredRoom = await startVideoChat(roomName, token);
    return requiredRoom;
};

async function startVideoChat(roomName, token) {
    const localTracks = await Twilio.Video.createLocalTracks();

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
                let dataRecieved = JSON.parse(data);
                dataRecieved.status = "recieve-msg";
                receiveMsg.push(dataRecieved);
            });
        }
        if (track.kind === 'audio' || track.kind === 'video') {
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

function setSenderMsg(sender) {
    receiveMsg.push(sender);
    dataTrack.send(JSON.stringify(sender));
}