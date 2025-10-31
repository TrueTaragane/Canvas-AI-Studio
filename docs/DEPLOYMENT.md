# Deployment Guide

This guide covers various deployment options for Canvas AI Studio, from simple static hosting to advanced configurations.

## 🚀 Quick Deployment

### Static File Hosting

Canvas AI Studio is a client-side application that requires no server-side processing. Simply upload all files to any web server.

**Requirements:**

- Web server capable of serving static files
- HTTPS support (recommended for API calls)
- Modern browser support

## 📁 Deployment Options

### 1. GitHub Pages

**Free hosting directly from your GitHub repository**

#### Setup Steps:

1. **Fork or clone** the repository
2. **Push to GitHub** (if not already there)
3. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Select source: "Deploy from a branch"
   - Choose branch: `main` or `master`
   - Select folder: `/ (root)`
4. **Access your site** at `https://yourusername.github.io/canvas-ai-studio`

#### Custom Domain (Optional):

1. Add `CNAME` file with your domain
2. Configure DNS to point to GitHub Pages
3. Enable HTTPS in repository settings

### 2. Netlify

**Modern hosting with continuous deployment**

#### Drag & Drop Deployment:

1. Visit [netlify.com](https://netlify.com)
2. Drag the project folder to the deploy area
3. Get instant URL

#### Git Integration:

1. Connect your GitHub repository
2. Set build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: (leave empty or set to `/`)
3. Deploy automatically on git push

#### Custom Configuration:

Create `netlify.toml`:

```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 3. Vercel

**Zero-configuration deployment**

#### CLI Deployment:

```bash
npm install -g vercel
vercel
```

#### Git Integration:

1. Connect GitHub repository
2. Import project
3. Deploy with default settings

#### Configuration:

Create `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### 4. Firebase Hosting

**Google's hosting platform**

#### Setup:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

#### Configuration (`firebase.json`):

```json
{
  "hosting": {
    "public": ".",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          }
        ]
      }
    ]
  }
}
```

### 5. AWS S3 + CloudFront

**Scalable cloud hosting**

#### S3 Setup:

1. Create S3 bucket
2. Enable static website hosting
3. Upload all files
4. Set bucket policy for public read

#### CloudFront Setup:

1. Create CloudFront distribution
2. Point to S3 bucket
3. Configure custom error pages
4. Enable HTTPS

### 6. Traditional Web Hosting

**Shared hosting, VPS, or dedicated servers**

#### Requirements:

- Web server (Apache, Nginx, IIS)
- HTTPS certificate
- Static file serving capability

#### Apache Configuration (`.htaccess`):

```apache
# Enable HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security headers
Header always set X-Frame-Options DENY
Header always set X-Content-Type-Options nosniff
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Cache static assets
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 month"
</FilesMatch>
```

#### Nginx Configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    root /path/to/canvas-ai-studio;
    index index.html;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1M;
        add_header Cache-Control "public, immutable";
    }

    # Fallback to index.html for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔧 Configuration

### Environment-Specific Settings

Canvas AI Studio is configured entirely client-side, but you may want to customize for different environments.

#### Development

- Enable detailed console logging
- Use development API endpoints (if any)
- Disable caching

#### Production

- Minimize console output
- Enable caching headers
- Add security headers

### Custom Branding

Modify these files for custom branding:

- `index.html` - Page title and meta tags
- `css/styles.css` - Colors and styling
- Add custom favicon files
- Update README.md with your information

### API Configuration

Users configure their own API keys, but you can:

- Provide setup instructions
- Add default API endpoints
- Include troubleshooting guides

## 🔒 Security Configuration

### HTTPS Requirements

**Always use HTTPS in production:**

- Required for Gemini API calls
- Protects user data in transit
- Prevents mixed content warnings
- Improves SEO rankings

### Security Headers

Implement these security headers:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; connect-src 'self' https://generativelanguage.googleapis.com;
```

### Content Security Policy

Customize CSP for your deployment:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;
  font-src 'self' https://cdnjs.cloudflare.com;
  connect-src 'self' https://generativelanguage.googleapis.com;
  img-src 'self' data: blob:;
"
/>
```

## 📊 Performance Optimization

### Caching Strategy

Configure appropriate cache headers:

**Static Assets** (CSS, JS, images):

- Cache-Control: `public, max-age=31536000` (1 year)
- Use versioning or hashing for cache busting

**HTML Files**:

- Cache-Control: `no-cache` or `max-age=3600` (1 hour)
- Always validate with server

### Compression

Enable gzip/brotli compression:

- Reduces file sizes by 60-80%
- Faster loading times
- Lower bandwidth usage

### CDN Integration

Consider using a CDN for:

- Global content delivery
- Reduced latency
- Better availability
- DDoS protection

## 🌍 Global Deployment

### Multi-Region Setup

For global users, consider:

- Multiple deployment regions
- CDN with global edge locations
- Regional API endpoints (if available)

### Internationalization

Prepare for multiple languages:

- Separate language files
- Dynamic text loading
- RTL language support
- Cultural adaptations

## 📈 Monitoring and Analytics

### Error Monitoring

Implement error tracking:

- JavaScript error monitoring
- API failure tracking
- User experience metrics

### Performance Monitoring

Track performance metrics:

- Page load times
- Canvas rendering performance
- API response times
- User interaction latency

### Privacy-Compliant Analytics

If adding analytics:

- Use privacy-focused solutions
- Respect user privacy
- Comply with GDPR/CCPA
- Provide opt-out options

## 🔄 Continuous Deployment

### GitHub Actions

Automate deployment with GitHub Actions:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: "."
          production-branch: main
          github-token: ${{ secrets.GITHUB_TOKEN }}
          deploy-message: "Deploy from GitHub Actions"
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Automated Testing

Add testing to deployment pipeline:

- HTML validation
- CSS linting
- JavaScript syntax checking
- Link checking
- Performance testing

## 🚨 Troubleshooting

### Common Deployment Issues

#### CORS Errors

- Ensure HTTPS is enabled
- Check API endpoint configurations
- Verify domain whitelist settings

#### File Not Found (404)

- Check file paths and case sensitivity
- Verify all files are uploaded
- Configure proper fallback routes

#### Mixed Content Warnings

- Ensure all resources use HTTPS
- Update any HTTP links to HTTPS
- Check third-party integrations

#### Performance Issues

- Enable compression
- Optimize images
- Implement caching
- Use CDN for static assets

### Debugging Tools

- Browser developer tools
- Network monitoring
- Performance profiling
- Error tracking services

## 📞 Support

### Deployment Support

- Check deployment platform documentation
- Review error logs and monitoring
- Test in staging environment first
- Have rollback plan ready

### Community Resources

- GitHub Issues for technical problems
- Platform-specific support channels
- Community forums and discussions
- Documentation and guides

---

**Ready to deploy?** Choose the option that best fits your needs and follow the detailed steps above. Remember to test thoroughly before going live! 🚀
