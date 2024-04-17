# Melody Merge

## Gantt Chart

![Gantt Chart](gantt-chart.webp)

## Abstract

Spotify is A music streaming service that has over 500 million active users worldwide and has a market share of over 50% in the UK (Competition and Markets Authority, 2023). The service allows users to listen to music for free with ads or pay for a premium subscription that removes ads and allows users to download music for offline listening (Spotify, n.d.-a). The service also allows users to create and share playlists with other users. However, there is no way to compare the music data of two or more users and create a playlist with the songs that they have in common.

Melody Merge is a web application that will allow two or more users to sign in with their Spotify account. When the users have signed in, they will be able to see the songs that they have in common. The application will also allow the users to create a playlist with those songs. The application will use the Spotify API to authenticate users and access their music data. The server will be created using Node.js and Express.js, and the real-time connection between the clients and the server will be handled using Socket.io.

The aim of this project is to create a web application that will allow users to compare their music data and create a playlist with the songs that they have in common. The application will be useful for users who want to discover new music that they have in common with their friends or family members.

## Introduction

### Project Requirements

- A functional web application that allows users to sign in with their Spotify account.
- A server that will handle the real-time connection between the clients and the server.
- A way to sign in and out of the application.
- A way to access the user's music data from Spotify.
- A way to compare the music data of two or more users.
- A way to create a playlist with the songs that the users have in common as well as the ability to rename the playlist and add cover art.
- If no cover art is provided, the application will combine the profile picture of the users.
- A way to switch between light and dark mode.

### Limitations

- The application will only work with Spotify accounts; accounts with other platforms like Apple Music or Tidal will not work.
- During development, the app will be in development mode. This limits the number of users to 25 and those users need to manually added to the allow list (Spotify, n.d.-b).

### Research into Existing Solutions

#### Shared Spotify

There is not a way to do what this project will solve using first-party software, however, there is an open-source third-party website developed by Paul Vidal called Shared Spotify that allows users to join a room and compare their music data to create a playlist with the songs that they have in common and works with both Spotify and Apple Music. It was make with Go for the backend, JavaScript for the frontend, and hosted with AWS. Shared Spotify does not allow the user to make a custom title or add a cover image -- instead generating one automatically. The website adds all of the songs to a playlist instead of letting the user choose what should and should not get added (Vildal, 2021).

## References

Competition and Markets Authority. (2023, November 29). _Music and streaming final report_. <https://assets.publishing.service.gov.uk/media/6384f43ee90e077898ccb48e/Music_and_streaming_final_report.pdf>

Spotify. (n.d.-a). _About Spotify_. <https://newsroom.spotify.com/company-info/>

Spotify. (n.d.-b). _Quota modes_. <https://developer.spotify.com/documentation/web-api/concepts/quota-modes/>

Vildal, P. (2021, April). _Shared Spotify_. GitHub. <https://github.com/paulvidal/shared-spotify/>
