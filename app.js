const searchBtn = document.getElementById("searchBtn");
const artistInput = document.getElementById("artistName");
const playlistDiv = document.getElementById("playlist");

// Spotify API credentials (Replace these with your own keys)
const clientId = "YOUR_SPOTIFY_CLIENT_ID";
const clientSecret = "YOUR_SPOTIFY_CLIENT_SECRET";

// Step 1: Function to get the access token
async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(clientId + ':' + clientSecret)}`
    },
    body: new URLSearchParams({
      'grant_type': 'client_credentials'
    })
  });
  const data = await response.json();
  return data.access_token;
}

// Step 2: Function to fetch songs by artist
async function fetchSongsByArtist(artistName) {
  const token = await getAccessToken();
  
  // Step 3: Search for the artist by name
  const searchResponse = await fetch(`https://api.spotify.com/v1/search?q=${artistName}&type=artist`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const searchData = await searchResponse.json();
  
  const artistId = searchData.artists.items[0]?.id;
  
  if (!artistId) {
    playlistDiv.innerHTML = 'Artist not found!';
    return;
  }

  // Step 4: Fetch albums or songs by the artist
  const albumsResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const albumsData = await albumsResponse.json();

  let songsList = [];
  for (const album of albumsData.items) {
    const tracksResponse = await fetch(album.href + "/tracks", {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const tracksData = await tracksResponse.json();
    tracksData.items.forEach(track => {
      songsList.push(track.name);
    });
  }

  // Step 5: Display the songs
  displayPlaylist(songsList);
}

// Step 6: Function to display the playlist on the page
function displayPlaylist(songs) {
  playlistDiv.innerHTML = '';
  if (songs.length === 0) {
    playlistDiv.innerHTML = 'No songs found.';
    return;
  }
  
  songs.forEach(song => {
    const songDiv = document.createElement("div");
    songDiv.classList.add("song");
    songDiv.textContent = song;
    playlistDiv.appendChild(songDiv);
  });
}

// Step 7: Event listener for the search button
searchBtn.addEventListener("click", () => {
  const artistName = artistInput.value.trim();
  if (artistName) {
    fetchSongsByArtist(artistName);
  } else {
    playlistDiv.innerHTML = 'Please enter an artist name.';
  }
});
