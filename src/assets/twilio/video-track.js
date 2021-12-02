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
            trackPublished(publication, 'publish');
        });

        room.on('trackUnpublished', publication => {
            onTrackUnPublished('unpublish', publication);
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

function screenShareEvent(a) {
    let screenIcon = document.getElementById("screenShareIcon");
    if (a == "No") {
        let remoteScreenPreview = document.getElementById('screenshare');
        if (remoteScreenPreview.querySelector('video')) {
            remoteScreenPreview.removeChild(remoteScreenPreview.querySelector('video'));
        }
        screenIcon.style.display = "none";
    } else {
        screenIcon.style.display = "inline-block";
    }
}
function participantConnected(participant, participantType) {
    console.log('Participant connected', participant);
    snackBar(participant, "Joined");

    if (room && room.participants && (room.participants.size == 0)) {
        screenShareEvent("No");
        callendarEvent(participant, 1);
    } else {
        screenShareEvent("Yes");
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

    // participant.on('trackPublished', trackPublished);

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
        screenShareEvent("No");
        callendarEvent(participant, 2);
    } else {
        screenShareEvent("Yes");
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
                if (document.getElementById("chat-badge").style.display != 'none') {
                    let chatBadge = document.getElementById("chat-badge");
                    chatBadge.style.display = "inline-block";
                }
            });
        } else if ((participant && participant != 'publish') && (track && track.kind && track.kind === 'video')) {
            const e1 = document.getElementById(participant.sid);
            if (!e1.querySelector('video')) {
                e1.appendChild(track.attach());
            }
        } else if ((participant && participant != 'publish') && (track.kind === 'audio')) {
            track.on('disabled', (a) => {
                /* Hide the associated <video> element and show an avatar image. */
                console.log("disable", a);
            });
            track.on('enabled', (b) => {
                /* Hide the avatar image and show the associated <video> element. */
                console.log("enabled", b);
            });
            const e1 = document.getElementById(participant.sid);
            if (!e1.querySelector('audio')) {
                e1.appendChild(track.attach());
            }
        } else {
            if (trackPublication.kind == 'video') {
                let remoteScreenPreview = document.getElementById('screenshare');
                let roomVideo = document.querySelector('.user-video video');
                if (!remoteScreenPreview.querySelector('video')) {
                    roomVideo.style.display = 'none';
                    remoteScreenPreview.appendChild(trackPublication.track.attach());
                }

            }
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

async function captureScreen(screenShareTrack) {
    screenTrack = screenShareTrack;
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

function onTrackUnPublished(publishType, publication) {
    if (publication.kind == 'video') {
        let remoteScreenPreview = document.getElementById('screenshare');
        let roomVideo = document.querySelector('.user-video video');
        if (remoteScreenPreview.querySelector('video')) {
            roomVideo.style.display = 'block';
            remoteScreenPreview.removeChild(remoteScreenPreview.querySelector('video'));
        }
    }
}

function screenShareHandler() {
    room.localParticipant.unpublishTrack(screenTrack);
    screenTrack.stop();
    screenTrack = null;
    let remoteScreenPreview = document.getElementById('screenshare');
    let roomVideo = document.querySelector('.user-video video');
    if (remoteScreenPreview.querySelector('video')) {
        roomVideo.style.display = 'block';
        remoteScreenPreview.removeChild(remoteScreenPreview.querySelector('video'));
    }
}