# Dr Festus Adedoyin - Academic Website

Modern, professional academic website with dark mode and advanced publication search.

## ✨ New Features

### 1. **Dark Mode Toggle** 🌙☀️
- Click the moon/sun icon in the navigation bar to switch between light and dark themes
- Your preference is saved automatically in your browser
- Works seamlessly across all pages
- Accessible with keyboard navigation

### 2. **Advanced Publication Search** 🔍
**Location**: Publications page

**Features**:
- **Real-time search**: Search by title, author, or keyword
- **Smart filtering**: Filter by Books, Journals, Conferences, or Chapters
- **Sorting options**: Sort publications by newest or oldest first
- **Clear button**: Quickly reset your search
- **Results counter**: See how many publications match your search
- **Instant updates**: No page reload required

**How to use**:
1. Go to the Publications page
2. Type in the search box to filter publications instantly
3. Use category buttons to narrow by publication type
4. Click sort buttons to reorder by date

## 📁 File Structure

```
website/
├── index.html              # Homepage with overview
├── about.html              # Academic background & qualifications
├── projects.html           # AI & Data Science projects
├── research.html           # Research grants & PhD supervision
├── teaching.html           # Programme leadership & teaching
├── publications.html       # Full publication list with search
├── contact.html            # Contact information
├── style.css               # Main stylesheet with dark mode
├── main.js                 # JavaScript functionality
├── index_old.html          # Backup of original single-page design
└── images/                 # Image assets
```

## 🎨 Design Features

- **Modern color palette**: Deep slate backgrounds with blue-purple gradients
- **Responsive design**: Works on desktop, tablet, and mobile
- **Glassmorphism effects**: Frosted glass navigation bar
- **Smooth animations**: Hover effects and transitions
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **British spelling**: Consistent UK English throughout

## 🚀 Technologies

- HTML5 (semantic markup)
- CSS3 (custom properties, flexbox, grid)
- Vanilla JavaScript (no dependencies)
- Google Fonts (Inter typeface)
- Local storage (for theme preference)

## 📱 Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔧 Customization

### Changing Colors
Edit CSS variables in `style.css` (lines 10-35):
```css
:root {
    --accent-colour: #3b82f6;  /* Primary brand color */
    --success-colour: #10b981; /* Accent color */
    /* ... other variables ... */
}
```

### Adding Content
- **New publications**: Add to appropriate category in `publications.html`
- **New projects**: Add cards to `projects.html`
- **Update CV details**: Modify `about.html` and `teaching.html`

## 📊 Performance

- Fast loading (< 1 second on broadband)
- Optimized images
- Minimal JavaScript
- CSS-only animations where possible

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigable
- Screen reader friendly
- Sufficient color contrast
- Focus indicators
- Alt text for all images

## 📈 Future Enhancements

Consider adding:
- Google Analytics tracking
- Contact form with validation
- Downloadable CV (PDF)
- Blog/news section
- Publication citation export (BibTeX, APA)
- Google Scholar metrics integration

## 📄 License

© 2026 Dr Festus Adedoyin. All rights reserved.

---

## 🔁 CI / Visitor Map

- **Workflow:** `.github/workflows/update-visitors.yml` — runs daily and supports manual dispatch.
- **What it does:** Executes `scripts/fetch_visitors.py` and updates `data/visitors.json` when counts change.
- **Required repo secrets:** `PLAUSIBLE_API_KEY` and `PLAUSIBLE_SITE` (when using Plausible), or `VISITOR_DATA_ENDPOINT` (optional, for a custom data endpoint).
- **Enable:** Add the secret(s) under the repository Settings → Secrets and ensure GitHub Actions are enabled for the repo.


**Maintained by**: Dr Festus Adedoyin  
**Institution**: Bournemouth University  
**Last Updated**: January 2026

## 🗂 Large Media / Hosting Recommendations

- Repo size has been reduced by removing very large media files from history. Large media were moved to a local backup branch `backup-before-clean`.
- For production hosting of videos and large images use an object store + CDN (recommended):
    - Amazon S3 + CloudFront, Google Cloud Storage + CDN, or Cloudflare R2 + Cloudflare CDN.
    - Benefits: reduced repo size, better bandwidth handling, lower page load times.

Quick S3 upload example (replace placeholders):
```bash
# Install AWS CLI and configure credentials (or use CI secrets)
aws s3 cp path/to/ffa.mp4 s3://your-bucket-name/media/ffa.mp4 --acl public-read --cache-control "public, max-age=31536000"
```

Update your `index.html` video/source URLs to point to the CDN URL (or S3 public URL).

- Alternative: Git LFS for keeping binaries with Git, but note storage & bandwidth quotas on GitHub LFS.

Git LFS quick setup (optional):
```bash
git lfs install
git lfs track "images/*.mp4"
git add .gitattributes
git add images/ffa.mp4
git commit -m "chore: track large media with Git LFS"
git push origin main
```

If you want, I can:
- Upload the large media to an S3 bucket (you'll need to provide credentials or a pre-configured bucket with upload access), and update `index.html` to reference the hosted files.
- Or set up `git lfs` tracking and help migrate the files onto Git LFS (requires you to accept LFS quotas or add billing for extra storage/bandwidth).
