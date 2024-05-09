const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const server = require("http").createServer(app);
const io = require("socket.io")(server);


app.use(express.static("public"));

app.get("/", (req, res) => {
	res.status(200).res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
	socket.on("create", () => {
		let ID;
		do {
			ID = Array(8).fill().map(() => "0123456789abcdefghigklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]).join("");
		} while (io.sockets.adapter.rooms.has(ID));
		
		socket.join(ID);
		socket.emit("create res", ID);
		console.log(`Socket ${socket.id} created room ${ID}`);
	});

	socket.on("join", (room) => {
		if (io.sockets.adapter.rooms.has(room)) {
			socket.join(room);
			socket.emit("join res", "success");
			console.log(`Socket ${socket.id} joined room ${room}`);
		} else {
			socket.emit("join res", "fail");
			console.log(`Socket ${socket.id} failed to join room ${room}`);
		}
	});

	socket.on("song data", (data) => {
		socket.spotifyID = data[0];
		socket.songData = data[1];
		console.log(socket.spotifyID, socket.songData);
	});
});

let port = process.argv[2] || 8080;

// validate port
if (isNaN(port) || port < 1 || port > 65535) {
	console.log("Invalid port");
	process.exit(1);
}

server.listen(port);

// check if port is in use
server.on("error", (err) => {
	if (err.code == "EADDRINUSE") {
		console.log(`Port ${port} is in use`);
	}
});