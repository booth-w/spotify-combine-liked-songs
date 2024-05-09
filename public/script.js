let socket = io.connect(location.host, {transports: ["websocket"]});
const CLIENT_ID = "9809b712b70243f8ab7b47eb8df04333";
let isInRoom = false;

$("#login").click(() => {
	let scopes = ["user-library-read"];
	let redirectURL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&show_dialog=true&redirect_uri=${encodeURIComponent(location.href+"callback.html")}&scope=${encodeURIComponent(scopes.join(" "))}&response_type=token`;
	window.open(redirectURL, "");
});

async function getUserID(token) {
	let [userID, name] = await fetch("https://api.spotify.com/v1/me", {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	}).then((res) => res.json()).then((data) => [data.id, data.display_name]);

	$(".login-notice").text(`Logged in as ${name}`);
	socket.emit("login", [userID, name]);

	// replace login button with get song data button
	$("#login").replaceWith(`<button id="getSongData">Get Song Data</button>`);
	$("#getSongData").click(async () => {
		if (!isInRoom) {
			alert("You need to join a room first");
			return;
		}
		let songs = await getSongs(token, `https://api.spotify.com/v1/me/tracks?limit=50`)
		$("#getSongData").text("Get Song Data (Done)");
		socket.emit("song data", songs);
	});
}

async function getSongs(token, url, songs = []) {
	return await fetch(url, {
		"method": "GET",
		"headers": {
			"Authorization": `Bearer ${token}`
		}
	}).then((res) => res.json()).then(async (data) => {
		songs.push(...data.items.map((item) => item.track.id));
		let percent = Math.round(songs.length / data.total * 100);
		$("#getSongData").text(`Get Song Data (${percent}%)`);
		if (data.next) await getSongs(token, data.next, songs);
		return songs;
	});
}

$("#createRoom").click(() => {
	socket.emit("create").on("create res", (room) => {
		$(".room-notice").html(`<div class="room-create-notice">Created room ${room} (Click to copy)</div>`);
		$(".room-create-notice").click(() => {
			navigator.clipboard.writeText(room);
			$(".room-create-notice").text(`Created room ${room} (Copied)`);
		});
		isInRoom = true;
	});
});

$("#joinRoom").click(() => {
	let room = prompt("Enter room ID");

	if (room == null) return;
	if (!/^[a-z0-9]{8}$/.test(room)) {
		alert("Invalid room ID");
		return;
	}

	socket.emit("join", room).on("join res", (res) => {
		if (res == "success") {
			$(".room-notice").text(`Joined room ${room}`);
			isInRoom = true;
		} else {
			$(".room-notice").text(`Failed to join room ${room}`);
		}
	});
});

socket.on("room update", (data) => {
	$(".room-members").empty();
	for (let [id, [spotifyID, name, songData]] of Object.entries(data)) {
		if (name) {
			$(".room-members").append(`<div>${name} ${songData ? `- ${songData.length} Songs`: ""}</div>`);
		}
	}
});

window.addEventListener("message", async (e) => {
	let hash = JSON.parse(e.data);
	if (hash.type == "access_token") {
		let token = hash.access_token;
		getUserID(token);
	}
}, false);
