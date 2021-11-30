let room;
let Video = Twilio.Video;
let dataTrack = new Twilio.Video.LocalDataTrack();
let calendarEventUrl = 'https://api.dev.cosmosclinical.com/api/CalendarEventParticipants/Activity';
let screenTrack;


async function joinRoom(responseData) {

    let roomName = await responseData.room;
    let token = await responseData.token;

    let requiredRoom = await startVideoChat(roomName, token);
    return requiredRoom;
};

async function startVideoChat(roomName, token) {
    const localTracks = await Twilio.Video.createLocalTracks();

    let allTracks = localTracks.concat(dataTrack);
    await Video.connect(token, {
        name: roomName,
        tracks: allTracks
    }).then(activeRoom => {
        console.log(`Successfully joined a Room: ${activeRoom}`);
        room = activeRoom;
        participantConnected(room.localParticipant, 'Local');
        room.participants.forEach(participantConnected);

        // subscribe to new participant joining event so we can display their video/audio
        room.on("participantConnected", participantConnected);

        room.on("participantDisconnected", participantDisconnected);
        window.addEventListener("beforeunload", tidyUp(room));
        window.addEventListener("pagehide", tidyUp(room));

        room.on('trackPublished', publication => {
            console.log('trakpublish', publication);
            onTrackPublished('publish', publication);
        });

        room.on('trackUnpublished', publication => {
            console.log('trakunpublish', publication);
            onTrackPublished('unpublish', publication);
        });

    }, error => {
        console.error(`Unable to connect to Room: ${error.message}`);
        room = "NoRoom";
    });
    return room;
}

function snackBar(participant, status) {
    if (status === 'Joined') {
        let participantNameContainer = document.getElementById("participantName");
        let createParticipantDiv = document.createElement("div");
        createParticipantDiv.classList.add("participant-div");
        let createParticipantName = document.createElement("label");
        createParticipantName.setAttribute("id", participant.sid + '-' + participant.identity);
        createParticipantName.innerText = participant.identity;
        createParticipantDiv.appendChild(createParticipantName);
        participantNameContainer.appendChild(createParticipantDiv);
    } else {
        document.getElementById(participant.sid + '-' + participant.identity).remove();
    }
    var x = document.getElementById("snackbar");
    x.className = "show";
    x.innerText = participant.identity + ` is ${status}.`;
    setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}

function participantConnected(participant, participantType) {
    console.log('Participant connected', participant);
    snackBar(participant, "Joined");

    if (room && room.participants && (room.participants.size == 0)) {
        callendarEvent(participant, 1);
    } else {
        callendarEvent(participant, 3);
    }

    if (participantType === 'Local') {
        let localVideo = document.getElementById("localVideo");

        const e1 = document.createElement('div');
        e1.setAttribute("id", participant.sid)
        localVideo.appendChild(e1);
    } else {
        let participants = document.getElementById("participants");

        const e1 = document.createElement('div');
        e1.setAttribute("id", participant.sid)
        participants.appendChild(e1);
    }

    requiredParticipantsContainerFit();
    participant.tracks.forEach((publication) => {
        trackPublished(publication, participant);
    });

    participant.on('trackPublished', trackPublished);

}

function requiredParticipantsContainerFit() {
    let localRoom = document.getElementById("localroom");
    if (room && room.participants && (room.participants.size == 0)) {
        localRoom.classList.remove("my-video");
        localRoom.classList.add("user-video");
    } else {
        localRoom.classList.remove("user-video");
        localRoom.classList.add("my-video");
    }
}

function participantDisconnected(participant) {
    snackBar(participant, "Left");
    if (room && room.participants && (room.participants.size == 0)) {
        callendarEvent(participant, 2);
    } else {
        callendarEvent(participant, 3);
    }
    participant.removeAllListeners();
    const el = document.getElementById(participant.sid);
    el.remove();
    requiredParticipantsContainerFit();
}

function trackPublished(trackPublication, participant) {
    const trackSubscribed = (track) => {
        if (track && track.kind && track.kind === 'data') {
            track.on('message', (data) => {
                let dataRecieved = JSON.parse(data);
                dataRecieved.status = "recieve-msg";
                let recieveParent = document.createElement('div');
                recieveParent.classList.add('reciever-div');
                let recieveContainer = document.createElement('label');
                recieveContainer.classList.add(dataRecieved.status);
                recieveContainer.innerText = dataRecieved.message;
                recieveParent.appendChild(recieveContainer);
                document.getElementById('chat-display').appendChild(recieveParent);
            });
        }
        if (participant && track && track.kind && (track.kind === 'audio' || track.kind === 'video')) {
            const e1 = document.getElementById(participant.sid);
            if (e1) e1.appendChild(track.attach());
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
    return function (event) {
        if (event.persisted) {
            return;
        }
        if (room) {
            room.disconnect();
            room = null;
        }
    };
};

async function callendarEvent(participant, EventNumber) {
    let requiredData = {
        EventId: room.name,
        ParticipantId: participant.identity,
        ActivityType: EventNumber
    }
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            console.log(xmlHttp.responseText);
        }
    }
    xmlHttp.open("post", calendarEventUrl);
    xmlHttp.setRequestHeader("Content-type", "application/json");
    xmlHttp.send(JSON.stringify(requiredData));
};

async function captureScreen() {
    try {
        // Create and preview your local screen.
        screenTrack = await createScreenTrack(720, 1280);
        // let localScreenShare = document.getElementById("local-screenshare");
        // localScreenShare.appendChild(screenTrack.attach());
        // Publish screen track to room
        await room.localParticipant.publishTrack(screenTrack, room.localParticipant);

        // When screen sharing is stopped, unpublish the screen track.
        screenTrack.on('stopped', () => {
            if (room) {
                room.localParticipant.unpublishTrack(screenTrack);
                screenTrack = null;
            }
        });

    } catch (e) {
        alert(e.message);
    }
}

function createScreenTrack(height, width) {
    if (typeof navigator === 'undefined'
        || !navigator.mediaDevices
        || !navigator.mediaDevices.getDisplayMedia) {
        return Promise.reject(new Error('getDisplayMedia is not supported'));
    }
    return navigator.mediaDevices.getDisplayMedia({
        video: {
            height: height,
            width: width
        }
    }).then(function (stream) {
        return new Video.LocalVideoTrack(stream.getVideoTracks()[0]);
    });
}

function onTrackPublished(publishType, publication) {
    if (screenTrack) {
        let remoteScreenPreview = document.getElementById('screenshare');
        let roomVideo = document.querySelector('.user-video video');
        if (publishType === 'publish') {
            roomVideo.style.display = 'none';
            if (publication.track) {
                remoteScreenPreview.appendChild(publication.track.attach());
            }

            publication.on('subscribed', track => {
                remoteScreenPreview.appendChild(track.attach());
            });
        } else if (publishType === 'unpublish') {
            roomVideo.style.display = 'block';
            if (remoteScreenPreview.hasChildNodes()) {
                remoteScreenPreview.removeChild(remoteScreenPreview.childNodes[0]);
            }
        }
    }
}