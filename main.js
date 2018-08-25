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
            console.log(res);
            const channel = res.result.items[0];
            const output = `
                <ul class="collection">
                    <li class="collection-item">Title: ${channel.snippet.title}</li>
                    <li class="collection-item">Suscribers: ${channel.statistics.subscriberCount}</li>
                    <li class="collection-item">View: ${channel.statistics.viewCount}</li>
                    <li class="collection-item">Videos: ${channel.statistics.videoCount}</li>
                    <li class="collection-item">Country: ${channel.snippet.country}</li>
                </ul>
                <p>${channel.snippet.description}</p>
                <hr>
                <a class="btn grey darken-2" target="_blank" href="https://youtube.com/${channel.snippet.customUrl}">Visit Channel</a>
            `;

            showChannelData(output);
        })
        .catch(err => alert('No Channel By That Name'));
}