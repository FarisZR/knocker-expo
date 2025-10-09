# PWA Deployment Guide

This guide explains how to deploy the Knocker app as a Progressive Web App (PWA) for static hosting.

## Features

- **PWA Support**: Installable on mobile and desktop devices
- **Offline-Ready**: Service worker caches assets for offline access
- **Auto-Knock**: Automatically performs a knock on page load/refresh when credentials are configured
- **Web-Optimized**: Background service controls are hidden on web builds

## Building for Static Hosting

To build the web version with PWA support:

```bash
npm run build:web
```

This command:
1. Exports the Expo app for web (`expo export --platform web`)
2. Injects PWA metadata into all HTML files
3. Copies the manifest.json and service-worker.js to the dist folder

The output will be in the `dist/` directory.

## Deployment

### GitHub Pages

1. Build the app:
   ```bash
   npm run build:web
   ```

2. Deploy the `dist/` folder to GitHub Pages:
   ```bash
   # Using gh-pages package
   npx gh-pages -d dist
   
   # Or manually copy files to your gh-pages branch
   ```

3. Configure GitHub Pages in your repository settings to serve from the appropriate branch.

### Other Static Hosts

The `dist/` folder can be deployed to any static hosting service:

- **Netlify**: Drag and drop the `dist/` folder or use the Netlify CLI
- **Vercel**: Deploy with `vercel dist/`
- **Cloudflare Pages**: Connect your repo and set build command to `npm run build:web` and output directory to `dist`
- **Firebase Hosting**: Deploy with `firebase deploy` after configuring `firebase.json` to point to `dist`
- **AWS S3**: Upload the `dist/` folder to an S3 bucket configured for static website hosting

## PWA Installation

Once deployed, users can install the PWA:

### Mobile (iOS/Android)
1. Visit the site in a mobile browser
2. Tap the browser menu
3. Select "Add to Home Screen" or "Install App"

### Desktop
1. Visit the site in Chrome, Edge, or other PWA-capable browser
2. Look for the install icon in the address bar
3. Click to install as a desktop app

## Auto-Knock Behavior

The app automatically performs a "knock" request in two scenarios:

1. **On page load/refresh**: When credentials (endpoint and token) are configured
2. **On button press**: When the user manually taps the "Knock" button

This ensures the IP is whitelisted immediately upon opening the app.

## Web-Specific Behavior

When running on web:
- Background service toggle is hidden (not applicable on web)
- Silent notification toggle is hidden (not applicable on web)
- Service worker handles caching and offline functionality instead of native background tasks

## Files

- `public/manifest.json`: PWA manifest defining app metadata and icons
- `public/service-worker.js`: Service worker for offline caching
- `scripts/inject-pwa-metadata.js`: Post-build script to inject PWA meta tags
- `app/_layout.tsx`: Registers the service worker on web
- `metro.config.js`: Metro bundler configuration

## Troubleshooting

### PWA not installable

1. Verify the site is served over HTTPS (required for PWA)
2. Check browser console for manifest or service worker errors
3. Ensure icons referenced in manifest.json are accessible

### Service worker not registering

1. Check that service-worker.js is accessible at the root of your domain
2. Verify HTTPS is enabled
3. Check browser console for registration errors

### Auto-knock not working

1. Open browser developer tools and check console for errors
2. Verify credentials are saved (check Application > Local Storage in DevTools)
3. Ensure the endpoint URL is correct and accessible from the web

## Development

To test the PWA locally:

```bash
# Build the app
npm run build:web

# Serve the dist folder with a local HTTP server
npx serve dist -p 3000
```

Then visit http://localhost:3000 in your browser.

Note: Service workers require HTTPS in production but work with localhost for development.
