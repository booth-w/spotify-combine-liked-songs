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
		socket.room = ID;
		socket.emit("create res", ID);
		console.log(`Socket ${socket.id} created room ${ID}`);
		roomUpdate();
	});

	socket.on("join", (room) => {
		if (io.sockets.adapter.rooms.has(room)) {
			socket.join(room);
			socket.room = room;
			socket.emit("join res", "success");
			console.log(`Socket ${socket.id} joined room ${room}`);
			roomUpdate();
		} else {
			socket.emit("join res", "fail");
			console.log(`Socket ${socket.id} failed to join room ${room}`);
		}
	});

	socket.on("disconnect", () => {
		console.log(`Socket ${socket.id} disconnected`);
		roomUpdate();
	});

	socket.on("login", (data) => {
		socket.spotifyID = data[0];
		socket.name = data[1];
		console.log(`Socket ${socket.id} logged in as ${socket.name}`);
		roomUpdate();
	});

	function roomUpdate() {
		let roomMembers = io.sockets.adapter.rooms.get(socket.room);
		if (!roomMembers) return;

		let data = {}
		for (let member of roomMembers) {
			let memberSocket = io.sockets.sockets.get(member);
			data[memberSocket.id] = [memberSocket.spotifyID, memberSocket.name, memberSocket.songData];
		}

		io.to(socket.room).emit("room update", data);
	}

	socket.on("song data", (songs) => {
		socket.songData = songs;
		console.log(socket.spotifyID, socket.songData);
		roomUpdate();
	});

	socket.on("merge songs", () => {
		let validMembers = [...io.sockets.adapter.rooms.get(socket.room)].filter(member => io.sockets.sockets.get(member).songData);
		let songs = [...validMembers].map(roomMember => io.sockets.sockets.get(roomMember).songData).reduce((a, b) => a.filter(c => b.includes(c)));
		socket.emit("merge songs", [validMembers.map(a => io.sockets.sockets.get(a).name), songs]);
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