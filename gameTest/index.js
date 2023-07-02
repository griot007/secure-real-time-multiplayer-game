let env = require('dotenv').config({ path: './env/mainSetting.env' })

const express = require('express');
const { Server } = require("socket.io");
const http = require('http');
const app = express();
const serverGame = require("./ServerGame");

const server = http.createServer(app);
const io = new Server(server);

port = env.parsed.PORT || 3030

app.use(express.static(__dirname + '/public'));

serverGame(io);

server.listen(port, () => {
  console.log(`http://localhost:${port}`);
}); 