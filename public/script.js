const Socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;

var peer = new Peer();

let myVideoStream;

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      console.log("peer onCall");
      call.answer(stream);
      const video = document.createElement("video");
      const videoID = `video${call.peer}`;
      video.setAttribute("id", videoID);
      call.on(
        "stream",
        (userVideoStream) => {
          addVideoStream(video, userVideoStream);
        },
        (e) => console.log("stream error:", e)
      );
    });

    Socket.on("user-connected", (userId) => {
      connecToNewUser(userId, stream);
    });

    Socket.on("user-disconnected", (userId) => {
      disconnectUser(userId);
    });

    let text = $("input");

    $("html").keydown((e) => {
      if (e.which == 13 && text.val().length !== 0) {
        Socket.emit("message", text.val());
        text.val("");
      }
    });

    Socket.on("createMessage", (message, userName) => {
      $("ul").append(
        `<li class="message"><b>${userName}</b><br/>${message}</li>`
      );
      scrollToBottom();
    });
  });

peer.on("open", (id) => {
  const name = prompt("naam toh batao zara").trim();
  Socket.emit("join-room", ROOM_ID, id, name);
});

const connecToNewUser = (userId, stream) => {
  console.log("calling");
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  const videoID = `video${userId}`;
  video.setAttribute("id", videoID);
  call.on(
    "stream",
    (userVideoStream) => {
      console.log("stream asigala");
      addVideoStream(video, userVideoStream);
    },
    (e) => console.log("stream error:", e)
  );
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  var d = $(".main_chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const playStop = () => {
  console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main_mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main_mute_button").innerHTML = html;
};

const setStopVideo = () => {
  const html = `
    <i class=" fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector(".main_video_button").innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main_video_button").innerHTML = html;
};

function guidGenerator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
}

function disconnectUser(userID) {
  $(`#video${userID}`).remove();
}
