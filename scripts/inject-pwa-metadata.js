#!/usr/bin/env node

/**
 * Post-build script to inject PWA metadata into exported HTML files
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

const pwaMetaTags = `
    <meta name="application-name" content="Knocker" />
    <meta name="description" content="Whitelist your IP address with a single knock" />
    <meta name="theme-color" content="#0a7ea4" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Knocker" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/assets/images/icon.png" />
`;

function injectMetaTags(htmlPath) {
  if (!fs.existsSync(htmlPath)) {
    console.log(`Skipping ${htmlPath} (not found)`);
    return;
  }

  let html = fs.readFileSync(htmlPath, 'utf8');
  
  // Check if already injected
  if (/rel\s*=\s*["']manifest["']/i.test(html)) {
    console.log(`PWA metadata already present in ${path.basename(htmlPath)}`);
    return;
  }

  // Inject before </head> (case-insensitive)
  if (!/<\/head>/i.test(html)) {
    console.warn(`Warning: No </head> tag found in ${path.basename(htmlPath)}, skipping injection`);
    return;
  }
  html = html.replace(/<\/head>/i, `${pwaMetaTags}</head>`);
  
  // Update title if empty or whitespace-only
  html = html.replace(/<title[^>]*>\s*<\/title>/i, '<title>Knocker</title>');
  
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`✓ Injected PWA metadata into ${path.basename(htmlPath)}`);
}

// Copy public assets
const publicDir = path.join(__dirname, '..', 'public');
if (fs.existsSync(publicDir)) {
  const files = ['manifest.json', 'service-worker.js'];
  files.forEach(file => {
    const src = path.join(publicDir, file);
    const dest = path.join(distDir, file);
    if (fs.existsSync(src)) {
      try {
        fs.copyFileSync(src, dest);
        console.log(`✓ Copied ${file} to dist/`);
      } catch (error) {
        console.error(`✗ Failed to copy ${file}:`, error.message);
        process.exit(1);
      }
    }
  });
}

// Copy app icons for PWA
const assetsDir = path.join(__dirname, '..', 'assets', 'images');
const distAssetsDir = path.join(distDir, 'assets', 'images');
if (fs.existsSync(assetsDir)) {
  // Create dist/assets/images if it doesn't exist
  if (!fs.existsSync(distAssetsDir)) {
    try {
      fs.mkdirSync(distAssetsDir, { recursive: true });
    } catch (error) {
      console.error('✗ Failed to create dist/assets/images:', error.message);
      process.exit(1);
    }
  }
  
  const iconFiles = ['icon.png', 'adaptive-icon.png'];
  iconFiles.forEach(file => {
    const src = path.join(assetsDir, file);
    const dest = path.join(distAssetsDir, file);
    if (fs.existsSync(src)) {
      try {
        fs.copyFileSync(src, dest);
        console.log(`✓ Copied ${file} to dist/assets/images/`);
      } catch (error) {
        console.error(`✗ Failed to copy ${file}:`, error.message);
        process.exit(1);
      }
    }
  });
}

// Process all HTML files in dist
const htmlFiles = fs.readdirSync(distDir)
  .filter(f => f.endsWith('.html'))
  .map(f => path.join(distDir, f));

console.log('Injecting PWA metadata into HTML files...');
htmlFiles.forEach(injectMetaTags);

console.log('\n✅ PWA setup complete!');
