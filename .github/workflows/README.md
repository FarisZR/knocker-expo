# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated deployment and CI/CD.

## Deploy Workflow

**File:** `deploy.yml`

### Overview

Automatically builds and deploys the Knocker PWA to GitHub Pages, with support for PR preview deployments.

### Triggers

- **Push to `main`**: Deploys production site to GitHub Pages
- **Pull Request events**: Creates/updates/removes PR preview deployments

### Jobs

#### Build and Deploy

1. **Checkout code**: Checks out the repository
2. **Setup Node.js**: Installs Node.js 20 with npm cache
3. **Install dependencies**: Runs `npm ci` for reproducible builds
4. **Build for web**: Runs `npm run build:web` to create static site
5. **Deploy to GitHub Pages** (main branch only):
   - Uses `peaceiris/actions-gh-pages@v4`
   - Publishes `dist/` folder to `gh-pages` branch
   - Updates production site
6. **Deploy PR Preview** (pull requests only):
   - Uses `rossjrw/pr-preview-action@v1`
   - Creates preview at `/pr-preview/pr-X/`
   - Automatically cleans up when PR is closed

### Configuration

#### Permissions

The workflow requires:
- `contents: write` - To push to the `gh-pages` branch
- `pull-requests: write` - To comment on PRs with preview links

#### Custom Domain

To use a custom domain:

1. Edit `deploy.yml` and replace the `cname` value:
   ```yaml
   cname: your-domain.com
   ```

2. Configure your DNS:
   - Add a CNAME record pointing to `yourusername.github.io`
   - Or add A records pointing to GitHub Pages IPs

3. Alternatively, remove the `cname` line to use the default GitHub Pages URL

### PR Preview URLs

PR previews are deployed to:
```
https://yourusername.github.io/knocker-expo/pr-preview/pr-{number}/
```

The `pr-preview-action` automatically:
- Creates preview on PR open/update
- Posts a comment with the preview URL
- Removes preview when PR is closed/merged

### GitHub Pages Setup

1. Go to repository Settings > Pages
2. Set Source to "Deploy from a branch"
3. Select the `gh-pages` branch and `/ (root)` folder
4. Click Save

The workflow will create and manage this branch automatically.

### Manual Deployment

To deploy manually without the workflow:

```bash
npm run build:web
npx gh-pages -d dist
```

### Troubleshooting

**Deployment fails:**
- Check that GitHub Pages is enabled in repository settings
- Verify the workflow has necessary permissions
- Check build logs for errors in `npm run build:web`

**PR previews not working:**
- Ensure `gh-pages` branch exists (created after first deployment)
- Verify `pull-requests: write` permission is granted
- Check that the PR is from the same repository (external forks may have limited permissions)

**Custom domain not working:**
- Verify DNS settings are correct
- Check that HTTPS is enabled in GitHub Pages settings
- Wait for DNS propagation (can take up to 24 hours)

### Build Time

Typical build time: 2-3 minutes
- Dependency installation: ~30s (with cache)
- Build: ~1-2 minutes
- Deployment: ~30s

### Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
- [rossjrw/pr-preview-action](https://github.com/rossjrw/pr-preview-action)
