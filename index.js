const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

const KICK_AUTH_URL = 'https://kick.com/oauth/authorize';
const KICK_TOKEN_URL = 'https://kick.com/oauth/token';

// --- Home page with login link ---
app.get('/', (req, res) => {
  const authUrl = `${KICK_AUTH_URL}?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&scope=chat:write`;
  res.send(`<a href="${authUrl}">Login with Kick</a>`);
});

// --- Handle OAuth callback ---
app.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('No code provided');

  try {
    const response = await axios.post(KICK_TOKEN_URL, {
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.REDIRECT_URI,
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
    });

    res.json({
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Failed to get tokens');
  }
});

// --- Get authenticated user's info ---
app.get('/me', async (req, res) => {
  const accessToken = req.query.access_token;
  if (!accessToken) return res.status(400).send('Missing access_token');

  try {
    const response = await axios.get('https://kick.com/api/v1/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Failed to fetch user info');
  }
});

// --- Get stream info by username (includes offline state) ---
app.get('/stream/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const response = await axios.get(`https://kick.com/api/v2/channels/${username}`);
    const channel = response.data;

    const isLive = !!channel.livestream;

    const streamData = {
      username: channel.username,
      is_live: isLive,
      stream_url: `https://kick.com/${username}`,
    };

    if (isLive) {
      streamData.title = channel.livestream.session_title;
      streamData.category = channel.livestream.category?.name || 'Unknown';
      streamData.viewer_count = channel.livestream.viewer_count;
    } else {
      streamData.title = channel.last_streamed_session?.session_title || 'Offline';
      streamData.category = channel.category?.name || 'N/A';
      streamData.viewer_count = 0;
    }

    res.json(streamData);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Failed to fetch stream info');
  }
});

// --- Frontend viewer with auto-refresh every 60 seconds ---
app.get('/viewer/:username', (req, res) => {
  const { username } = req.params;

  res.send(`
    <html>
      <head>
        <title>${username}'s Stream Info</title>
        <style>
          body { font-family: sans-serif; padding: 20px; background: #f9f9f9; }
          #info { margin-top: 1em; font-size: 18px; }
        </style>
      </head>
      <body>
        <h1>Stream Info: ${username}</h1>
        <div id="info">Loading...</div>
        <script>
          async function fetchStreamInfo() {
            const res = await fetch('/stream/${username}');
            const data = await res.json();

            document.getElementById('info').innerHTML =
              data.is_live
                ? \`
                  <strong>Status:</strong> <span style="color: green;">LIVE</span><br>
                  <strong>Title:</strong> \${data.title}<br>
                  <strong>Category:</strong> \${data.category}<br>
                  <strong>Viewers:</strong> \${data.viewer_count}<br>
                  <a href="\${data.stream_url}" target="_blank">Watch Stream</a>
                \`
                : \`
                  <strong>Status:</strong> <span style="color: red;">OFFLINE</span><br>
                  <strong>Last Stream Title:</strong> \${data.title}<br>
                  <strong>Category:</strong> \${data.category}<br>
                  <a href="\${data.stream_url}" target="_blank">Visit Channel</a>
                \`;
          }

          fetchStreamInfo();
          setInterval(fetchStreamInfo, 60000); // every 60 seconds
        </script>
      </body>
    </html>
  `);
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
