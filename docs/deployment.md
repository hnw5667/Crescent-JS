# Deployment Guide

Deploy your Crescent.js applications to production.

---

## Production Build

Crescent.js applications can be deployed on any Node.js hosting platform. The framework bundles everything needed to run in a production environment.

### Basic Deployment

```bash
# Run your application on a specific port
crescent run src/app.js 8080

# Or let it default to port 3000
crescent run src/app.js
```

---

## Platform Deployments

### Vercel

Create a `vercel.json` in your project root:

```json
{
  "builds": [
    {
      "src": "src/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "src/app.js" }
  ]
}
```

### Railway / Render / Heroku

These platforms auto-detect Node.js apps. Ensure your `package.json` has a start script:

```json
{
  "scripts": {
    "start": "crescent run src/app.js $PORT"
  }
}
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["crescent", "run", "src/app.js"]
```

Build and run:

```bash
docker build -t crescent-app .
docker run -p 3000:3000 crescent-app
```

---

## GitHub Pages

Since Crescent.js requires a Node.js server for backend functionality, GitHub Pages (which only serves static files) is not suitable for running Crescent applications directly. For the backend functionality, use platforms like Railway, Render, or Fly.io alongside GitHub Pages for any static assets.

---

## Environment Variables

```bash
PORT=3000
NODE_ENV=production
DB_PATH=./data/db.json
SESSION_SECRET=your-secret-key
```

Access in Crescent:

```js
// In your backend logic
const port = process.env.PORT || 3000;
```

---

## Performance Tips

1. **Use ratio-based scaling** — Objects resize automatically across devices
2. **Lazy load images** — Use image layers with defer loading
3. **Minimize layer count** — Fewer layers means faster rendering
4. **Group related operations** — Batch layer additions before rendering

---

## Monitoring

- Log requests through Crescent's API server middleware
- Use `process` monitoring for memory and CPU
- Set up health-check endpoints:

```js
api.add_endpoint('GET', '/health', (req, res) => {
  res.writeHead(200);
  res.end('OK');
});
```