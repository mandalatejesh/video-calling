/* javascript for the frontend */

//const { socket } = require("socket.io");
const socket = io("/");

const videoGrid = document.getElementById("video-grid");

const localVideo = document.createElement("video");
localVideo.muted = true;
let localStream;

const peers = {};

let myPeer = new Peer(undefined, {
  host: "/" /* 
  host: "/", */,
  port: "3001",
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
    localStream = stream;
    addVideoStream(localVideo, stream, 0);

    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream, 1);
      });
    });
    socket.on("user-connected", (userId) => {
      connectNewUser(userId, stream);
    });
  });

socket.on("recieve-message", (msg, userId, username) => {
  document.getElementById("chat-dialogue").innerHTML +=
    "<li><strong>" + username + ":</strong>\n" + msg;
});
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

function connectNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream, 1);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userId] = call;
}

const addVideoStream = (video, stream, who) => {
  /* play the stream */
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  //videoGrid.append(video);
  if (who == 0) {
    document.getElementById("local").append(video);
  } else {
    document.getElementById("remote").append(video);
  }
};

function sendData() {
  let msg = document.getElementById("send-text").value;
  /* emit data */
  socket.emit("send-message", msg);

  document.getElementById("chat-dialogue").innerHTML +=
    "<li><strong>" + USER_NAME + ":</strong><br/>" + msg;
  document.getElementById("send-text").value = "";
  let element = document.getElementById("chat-dialogue");
  element.scrollIntoView(false);
}
document.getElementById("send-text").addEventListener("keyup", (e) => {
  if (e.key == "Enter") {
    e.preventDefault();
    document.getElementById("send-btn").click();
  }
});
