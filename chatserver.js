/* express js for server */
const express = require("express");
const app = express();
const server = require("http").Server(app);

/* import socket.io */
const io = require("socket.io")(server); 
/* setup peer server*/
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
}); 

app.use("/peerjs", peerServer);
/* view engine for the app */
app.set("view engine", "ejs");

/* script is gonna be in public folder uri */
app.use(express.static("public")); // all the static files in public directory

/*on get request, render homepage*/
app.get("/", (req, res) => {
  res.render("homepage");
});

/* chatroom is the parameter for the redirected request */
app.get("/:chatRoom", (req, res) => {
  res.render("chatRoom", {
    roomId: req.params.chatRoom,
    username: req.query.username,
  });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, username) => {
    socket.join(roomId); // join the room
    socket.to(roomId).emit("user-connected", userId); // inform all that a user is connected

    socket.on("send-message", (msg) => {
      socket.to(roomId).emit("recieve-message", msg, userId, username);
    });
    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

server.listen(process.env.PORT || 3000);
