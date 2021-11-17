let room;
let Video = Twilio.Video;
let dataTrack = new Twilio.Video.LocalDataTrack();

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

function snackBar(participant, status) {
    if (status === 'Joined') {
        let participantNameContainer = document.getElementById("participantName");
        let createParticipantName = document.createElement("p");
        createParticipantName.setAttribute("id", participant.sid + '-' + participant.identity);
        createParticipantName.innerText = participant.identity;
        participantNameContainer.appendChild(createParticipantName);
    } else {
        document.getElementById(participant.sid + '-' + participant.identity).remove();
    }
    var x = document.getElementById("snackbar");
    x.className = "show";
    x.innerText = participant.identity + ` is ${status}.`;
    setTimeout(function() { x.className = x.className.replace("show", ""); }, 3000);
}

function participantConnected(participant) {
    console.log('Participant connected', participant);
    snackBar(participant, "Joined");

    let participants = document.getElementById("participants");

    const e1 = document.createElement('div');
    e1.setAttribute("id", participant.sid)
    participants.appendChild(e1);

    participant.tracks.forEach((publication) => {
        trackPublished(publication, participant);
    });

    participant.on('trackPublished', trackPublished);

}

function participantDisconnected(participant) {
    snackBar(participant, "Left");
    participant.removeAllListeners();
    const el = document.getElementById(participant.sid);
    el.remove();
}

function trackPublished(trackPublication, participant) {
    const trackSubscribed = (track) => {
        if (track.kind === 'data') {
            track.on('message', (data) => {
                let dataRecieved = JSON.parse(data);
                dataRecieved.status = "recieve-msg";
                let recieveContainer = document.createElement('p');
                recieveContainer.classList.add(dataRecieved.status);
                recieveContainer.innerText = dataRecieved.message;
                document.getElementById('chat-display').appendChild(recieveContainer);
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

function setSenderMsg(sender) {
    dataTrack.send(JSON.stringify(sender));
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