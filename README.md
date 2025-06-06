

<h2>🚀 Features</h2>
<ul>
  <li>OAuth2 login via Kick</li>
  <li>Stream info: title, viewer count, category</li>
  <li>Offline fallback support</li>
  <li>Auto-refreshing viewer dashboard (every 60s)</li>
  <li>JSON-based stream data logging</li>
</ul>

<h2>📦 Requirements</h2>
<ul>
  <li>Node.js v14+</li>
  <li>A Kick client ID and secret (<a href="https://docs.kick.com/getting-started/generating-tokens-oauth2-flow" target="_blank">get yours here</a>)</li>
</ul>

<h2>🔧 Setup</h2>

<pre><code># Clone or download the project
npm install

# Create a .env file
</code></pre>

<h3>.env</h3>
<pre><code>CLIENT_ID=your_kick_client_id
CLIENT_SECRET=your_kick_client_secret
REDIRECT_URI=http://localhost:3000/callback
</code></pre>

<h2>🏃 Run the App</h2>
<pre><code>node index.js</code></pre>

<h2>🔗 Example Routes</h2>
<ul>
  <li><a href="http://localhost:3000">/</a> – Kick OAuth login</li>
  <li><code>/callback</code> – OAuth handler</li>
  <li><code>/me?access_token=YOUR_TOKEN</code> – Authenticated user info</li>
  <li><code>/stream/&lt;username&gt;</code> – Stream info (JSON)</li>
  <li><code>/viewer/&lt;username&gt;</code> – Live viewer dashboard</li>
</ul>

<h2>🗂 Log File</h2>
<p>Each request to <code>/stream/:username</code> is logged with a timestamp in <strong>stream_log.json</strong> like this:</p>

<pre><code>[
  {
    "username": "trainwreckstv",
    "is_live": true,
    "viewer_count": 12093,
    "category": "Just Chatting",
    "title": "We're Back!",
    "timestamp": "2025-06-06T19:45:30.000Z",
    "stream_url": "https://kick.com/trainwreckstv"
  }
]
</code></pre>

<h2>📘 License</h2>
<p>GNU General Public License v3.0</p>

<h2>👨‍💻 Author</h2>
<p>Created by you. Want to contribute or expand this with graphs, alerts, or database support? PRs welcome!</p>
