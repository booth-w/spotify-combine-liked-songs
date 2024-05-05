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