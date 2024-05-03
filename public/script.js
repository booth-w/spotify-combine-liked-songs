let socket = io.connect(location.host, {transports: ["websocket"]});
const CLIENT_ID = "9809b712b70243f8ab7b47eb8df04333";

$("#login").click(() => {
	let scopes = ["user-library-read"];
	let redirectURL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&show_dialog=true&redirect_uri=${encodeURIComponent(location.href+"callback.html")}&scope=${encodeURIComponent(scopes.join(" "))}&response_type=token`;
	window.open(redirectURL, "");
});

async function addUser(token) {
	let name = await fetch("https://api.spotify.com/v1/me", {
		method: "GET",
		headers: {
			"Authorization": `Bearer ${token}`
		}
	}).then((res) => res.json()).then((data) => data.display_name);
	$("button").remove();
	$("body").append(`${name}: ${token}`);
}

window.addEventListener("message", async (e) => {
	let hash = JSON.parse(e.data);
	if (hash.type == "access_token") {
		let token = hash.access_token;
		addUser(token);
	}
}, false);
