let socket = io.connect(location.host, {transports: ["websocket"]});
const CLIENT_ID = "9809b712b70243f8ab7b47eb8df04333";
let isInRoom = false;
let token;

$("#login").click(() => {
	let scopes = ["user-library-read", "playlist-modify-private"];
	let redirectURL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&show_dialog=true&redirect_uri=${encodeURIComponent(location.href+"callback.html")}&scope=${encodeURIComponent(scopes.join(" "))}&response_type=token`;
	window.open(redirectURL, "");
});

async function addUser() {
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
		let songs = await getSongs(`https://api.spotify.com/v1/me/tracks?limit=50`)
		$("#getSongData").text("Get Song Data (Done)");
		$("#createPlaylist").show();
		socket.emit("song data", songs);
	});
}

async function getSongs(url, songs = []) {
	return await fetch(url, {
		"method": "GET",
		"headers": {
			"Authorization": `Bearer ${token}`
		}
	}).then((res) => res.json()).then(async (data) => {
		songs.push(...data.items.map((item) => item.track.id));
		let percent = Math.round(songs.length / data.total * 100);
		$("#getSongData").text(`Get Song Data (${percent}%)`);
		if (data.next) await getSongs(data.next, songs);
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

$("#createPlaylist").click(() => {
	socket.emit("merge songs").on("merge songs", (res) => {
		$(".create-playlist-modal").show();
		$(".body").css("filter", "blur(2px)");

		$("#playlistName").attr("placeholder", `Shared Playlist of ${res[0].length <= 2 ? res[0].join(" and ") : `${res[0].slice(0, -1).join(", ")}, and ${res[0].slice(-1)}`}`);
		
		res[1].forEach(async song => {
			songData = await fetch(`https://api.spotify.com/v1/tracks/${song}`, {
				"method": "GET",
				"headers": {
					"Authorization": `Bearer ${token}`
				}
			}).then((res) => res.json());

			let albumLink = songData.album.images[2].url;
			$(".songs").append(`
				<div class="song">
					<img src="${albumLink}" alt="Album Art">
					<div>
						<div>${songData.name}</div>
						<div>${songData.artists.map(artist => artist.name).join(", ")}</div>
					</div>
					<input id="${songData.id}-checkbox" type="checkbox" checked>
				</div>
			`);
		});
	});
});

$(".create-playlist-button").click(async () => {
	let playlistName = $("#playlistName").val() || $("#playlistName").attr("placeholder");
	let songs = $(".song").map((i, song) => {
		if ($(song).find("input").is(":checked")) {
			return $(song).find("input").attr("id").split("-")[0];
		}
	}).get();

	let id = await fetch("https://api.spotify.com/v1/me", {
		"method": "GET",
		"headers": {
			"Authorization": `Bearer ${token}`
		}
	}).then((res) => res.json()).then((data) => data.id);

	let playlistID = await fetch(`https://api.spotify.com/v1/users/${id}/playlists`, {
		"method": "POST",
		"headers": {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json"
		},
		"Access-Control-Allow-Origin": "*",
		"body": JSON.stringify({
			"name": playlistName,
			"public": false
		})
	}).then((res) => res.json()).then((data) => data.id);

	fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
		"method": "POST",
		"headers": {
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json"
		},
		"Access-Control-Allow-Origin": "*",
		"body": JSON.stringify({
			"uris": songs.map(song => `spotify:track:${song}`)
		})
	}).then((res) => res.json()).then((res) => {
		if (res.message == "No uris provided") {
			alert("Playlist cannot be empty");
			return;
		}

		alert(`Created playlist ${playlistName}`);
		$(".create-playlist-modal").hide();
		$(".body").css("filter", "none");
	});
});

$(".close").click(() => {
	$(".create-playlist-modal").hide();
	$(".body").css("filter", "none");
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
		token = hash.access_token;
		addUser();
	}
}, false);
