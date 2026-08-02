export default function DeploymentPage() {
  return (
    <>
      <h1>Deployment Guide</h1>
      <p>Deploy your Crescent.js applications to production.</p>

      <hr />

      <h2>Running in Production</h2>
      <pre><code>{`# Run on a specific port
crescent run src/app.js 8080

# Auto-run on port 3000
crescent run src/app.js`}</code></pre>

      <hr />

      <h2>Vercel</h2>
      <p>Create a <code>vercel.json</code>:</p>
      <pre><code>{`{
  "builds": [{ "src": "src/**/*.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/app.js" }]
}`}</code></pre>

      <hr />

      <h2>Railway / Render / Heroku</h2>
      <p>These platforms auto-detect Node.js apps. Add a start script to <code>package.json</code>:</p>
      <pre><code>{`{
  "scripts": {
    "start": "crescent run src/app.js $PORT"
  }
}`}</code></pre>

      <hr />

      <h2>Docker</h2>
      <pre><code>{`FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["crescent", "run", "src/app.js"]`}</code></pre>

      <pre><code>docker build -t crescent-app .
docker run -p 3000:3000 crescent-app</code></pre>

      <hr />

      <h2>GitHub Pages</h2>
      <p>Crescent.js requires a Node.js server for backend functionality, so GitHub Pages alone cannot run Crescent apps. Use platforms like Railway, Render, or Vercel for backend hosting alongside static hosting if needed.</p>

      <hr />

      <h2>Environment Variables</h2>
      <pre><code>PORT=3000
NODE_ENV=production
DB_PATH=./data/db.json
SESSION_SECRET=your-secret-key</code></pre>

      <hr />

      <h2>Health Check Endpoint</h2>
      <pre><code>{`const api = crescent.api_make({ api_id: 'api', port: 3000 });

api.add_endpoint('GET', '/health', (req, res) => {
  res.writeHead(200);
  res.end('OK');
});

api.start();`}</code></pre>

      <hr />

      <h2>Performance Tips</h2>
      <ul>
        <li>Use ratio-based scaling — objects resize automatically across devices</li>
        <li>Minimize layer count — fewer layers means faster rendering</li>
        <li>Group related operations — batch layer additions before rendering</li>
        <li>Use middleware for request logging and monitoring</li>
      </ul>
    </>
  );
}