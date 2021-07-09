/* javascript for the frontend */

// const { Socket } = require("socket.io");
const socket = io("/");

const videoGrid = document.getElementById("video-grid");

const localVideo = document.createElement("video");
localVideo.muted = true;

const peers = {};

let myPeer = new Peer(undefined, {
  //path: "/peerjs",
  host: "/",
  port: "443",
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, USER_NAME);
  console.log("rendered chat room");
});

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(localVideo, stream);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on("user-connected", (userId) => {
      connectNewUser(userId, stream);
    });
  });

socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

socket.on("recieve-message", (msg, userId, username) => {
  document.getElementById("chat-dialogue").innerHTML +=
    "<li><strong>" + username + ":</strong>\n" + msg;
});

function connectNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
}

const addVideoStream = (video, stream) => {
  /* play the stream */
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

function sendData() {
  let msg = document.getElementById("send-text").value;
  /* emit data */
  socket.emit("send-message", msg);

  document.getElementById("chat-dialogue").innerHTML +=
    "<li><strong>" + USER_NAME + ":</strong>\n" + msg;
  document.getElementById("send-text").value = "";
}
document.getElementById("send-text").addEventListener("keyup", (e) => {
  if (e.key == "Enter") {
    e.preventDefault();
    document.getElementById("send-btn").click();
  }
});
