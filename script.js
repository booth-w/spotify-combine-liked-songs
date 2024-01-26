const CLIENT_ID = "9809b712b70243f8ab7b47eb8df04333";

$("#login").click(() => {
	console.log("Login clicked");
	let scopes = ["user-library-read"];
	let redirectURL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&show_dialog=true&redirect_uri=${encodeURIComponent(location.href+"callback.html")}&scope=${encodeURIComponent(scopes.join(" "))}&response_type=token`;
	window.open(redirectURL, "");
});

window.addEventListener("message", (e) => {
	let hash = JSON.parse(e.data);
	if (hash.type == "access_token") {
		let token;
		((token_ = hash.access_token) => {
			token = token_;
			return $.ajax({
				url: "https://api.spotify.com/v1/me",
				headers: {
					"Authorization": `Bearer ${token}`
				}
			});
		})().then(async () => {
			let name = await fetch("https://api.spotify.com/v1/me", {
				method: "GET",
				headers: {
					"Authorization": `Bearer ${token}`
				}
			}).then((res) => res.json()).then((data) => data.display_name);
			alert(`Logged in as ${name}`);
		});
	}
}, false);