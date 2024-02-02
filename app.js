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

server.listen(8080, () => {
	console.log("Server started on port 8080");
});
