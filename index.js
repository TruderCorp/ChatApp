const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const io = new Server(server);
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", socket => {
  console.log("[Server] User Connected");
  io.emit("chat message", "User Connected", "main room", "Server");
  
  socket.on("chat message", (msg, roomName, username1) => {
    io.emit("chat message", msg , roomName, username1);
  });


  socket.on("disconnect", () => {
    console.log("[Server] User Disconnected");
    io.emit("chat message", "User Disconnected", "main room", "Server");
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
