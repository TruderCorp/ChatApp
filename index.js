const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  
];
const genAI = new GoogleGenerativeAI("AIzaSyBxRgczDIEj60iprRATY_H7RDdHirqScPI");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" ,safetySettings: safetySettings});
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
  io.emit("chat message", "Welcome, new user! This is TruDEX AI! Type /ai to get started.", "main room", "TruDEX AI (Preview)");

  socket.on("chat message", (msg, roomName, username1) => {
    if (msg.includes("/ai") || msg.includes("/AI")) {
      const prompt = msg.replace("/ai", "").replace("/AI", "");
      (async () => {
        const result = await model.generateContent(prompt);
        console.log(result);
        io.emit("chat message", result.response.text() , roomName, "TruDEX AI (Preview)");
     
      })();
      
       io.emit("chat message", msg , roomName, username1);

     
    } else {
    io.emit("chat message", msg , roomName, username1);
    }
  });


  socket.on("disconnect", () => {
    console.log("[Server] User Disconnected");
    io.emit("chat message", "User Disconnected", "main room", "Server");
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
