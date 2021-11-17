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

function setSenderMsg(sender) {
    dataTrack.send(JSON.stringify(sender));
}