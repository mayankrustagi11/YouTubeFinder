/* OPTIONS */
const CLIENT_ID = '580943661229-jms8rbt19jg6jgrlmv8kalgue7mqgcjl.apps.googleusercontent.com';
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/youtube.readonly';

const authorizeButton = document.getElementById('authorize-button');
const signoutButton = document.getElementById('signout-button');
const content = document.getElementById('content');
const channelForm = document.getElementById('channel-form');
const channelInput = document.getElementById('channel-input');
const videoContainer = document.getElementById('video-container');

const defaultChannel = 'techguyweb';

/* FORM SUBMIT */
channelForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const channel = channelInput.value;
    getChannel(channel);
});

/* LOAD AUTH@ LIBRARY */
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/* INIT API CLIENT LIBRARY */
function initClient() {
    gapi.client
        .init({
            discoveryDocs: DISCOVERY_DOCS,
            clientId: CLIENT_ID,
            scope: SCOPES
        })
        .then(() => {
            // Listen for sign in state changes
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            // Handle initial sign in state
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.onclick = handleAuthClick;
            signoutButton.onclick = handleSignoutClick;
        });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        content.style.display = 'block';
        videoContainer.style.display = 'block';
        getChannel(defaultChannel);
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
        content.style.display = 'none';
        videoContainer.style.display = 'none';
    }
}

/* HANDLE SIGNIN */
function handleAuthClick() {
    gapi.auth2.getAuthInstance().signIn();
}

/* HANDLE SIGNOUT */
function handleSignoutClick() {
    gapi.auth2.getAuthInstance().signOut();
}

/* DISPLAY CHANNEL DATA */
function showChannelData(data) {
    const channelData = document.getElementById('channel-data');
    channelData.innerHTML = data;
}

/* GET CHANNEL DETAILS FROM API */
function getChannel(channel) {
    gapi.client.youtube.channels.list({
            part: 'snippet,contentDetails,statistics',
            forUsername: channel
        })
        .then(res => {
            const channel = res.result.items[0];
            const output = `
                <ul class="collection">
                    <li class="collection-item">Title: ${channel.snippet.title}</li>
                    <li class="collection-item">Suscribers: ${numberWithCommas(channel.statistics.subscriberCount)}</li>
                    <li class="collection-item">View: ${numberWithCommas(channel.statistics.viewCount)}</li>
                    <li class="collection-item">Videos: ${numberWithCommas(channel.statistics.videoCount)}</li>
                    <li class="collection-item">Country: ${channel.snippet.country}</li>
                </ul>
                <p>${channel.snippet.description}</p>
                <hr>
                <a class="btn black" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
            `;

            showChannelData(output);

            const playlistId = channel.contentDetails.relatedPlaylists.uploads;
            requestVideoPlaylist(playlistId);
        })
        .catch(err => alert('No Channel By That Name'));
}

function requestVideoPlaylist(playlistId) {
    const requestOptions = {
        playlistId: playlistId,
        part: 'snippet',
        maxResults: 15
    }

    const request = gapi.client.youtube.playlistItems.list(requestOptions);
    request.execute(res => {
        const playListItems = res.result.items;
        if (playListItems) {
            let output = `<br><h4 class="center-align">Latest Videos</h4>`;

            /* LOOP THROUGH VIDEOS */
            playListItems.forEach(item => {
                const videoId = item.snippet.resourceId.videoId;
                output += `
                    <div class="col l4 m6 s12">
                        <iframe width="100%" height="auto" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                    </div>
                `;
            });

            videoContainer.innerHTML = output;
        } else {
            videoContainer.innerHTML = 'No Uploaded Videos';
        }
    })
}

function numberWithCommas(value) {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}