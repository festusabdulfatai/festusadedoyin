// ============================================
// Animated Counter Functionality
// ============================================

function animateCounter(element, target, duration = 1200) {
    let start = 0;
    const increment = target / (duration / 16);
    function update() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }
    update();
}

document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...

    // Animated counters for stats
    const counters = [
        { selector: '.phd-count', value: 6 },
        { selector: '.funding-count', value: 250000 },
        { selector: '.pub-count', value: 70 },
        { selector: '.industry-count', value: 3 }
    ];
    counters.forEach(counter => {
        const el = document.querySelector(counter.selector);
        if (el) animateCounter(el, counter.value);
    });

    // ...existing code...
});

// ============================================
// Visitor map rendering (privacy-first)
// Looks for local data at `/data/visitors.json` or a configured endpoint via
// <meta name="visitor-data-endpoint" content="/api/visitors">. Only renders if
// analytics opt-in (`site_analytics_opt_in_v1` localStorage) is true.
// Data format expected: { "US": 120, "GB": 34, "NG": 5 }
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('visitor-map');
    if (!container) return;

    const legendEl = document.getElementById('visitor-legend');
    const svg = document.getElementById('visitor-svg');
    const dots = document.getElementById('map-dots');
    if (!svg || !dots || !legendEl) return;

    const centroids = {
        "US": [-98.35, 39.50], "GB": [-2.0, 54.0], "NG": [8.6753, 9.0820], "IN": [78.9629, 20.5937],
        "CA": [-106.34, 56.13], "AU": [134.49, -25.73], "DE": [10.45, 51.17], "FR": [2.21, 46.23],
        "ES": [-3.7, 40.4], "IT": [12.57, 41.87], "NL": [5.29, 52.13], "SE": [18.64, 60.13], "NO": [8.47, 60.47],
        "DK": [9.5, 56.26], "CN": [104.19, 35.86], "JP": [138.25, 36.20], "KR": [127.77, 35.91], "BR": [-51.92, -14.24],
        "ZA": [22.94, -30.56], "KE": [37.91, -0.02], "GH": [-1.02, 7.95], "IE": [-8.24, 53.14], "CH": [8.23, 46.82],
        "BE": [4.47, 50.50], "PT": [-8.24, 39.40], "MX": [-102.55, 23.63], "AR": [-63.62, -38.42], "RU": [105.32, 61.52],
        "TR": [35.24, 38.96], "PK": [69.34, 30.38], "BD": [90.41, 23.69], "VN": [108.27, 14.06], "ID": [113.92, -0.79],
        "PH": [121.78, 12.87], "TH": [100.99, 15.87], "EG": [30.80, 26.82], "SA": [45.08, 23.88], "IL": [34.85, 31.05]
    };

    function project(lon, lat) {
        const w = 600, h = 320; // viewBox dimensions
        const x = ((lon + 180) / 360) * w;
        const y = ((90 - lat) / 180) * h;
        return [x, y];
    }

    function render(data) {
        dots.innerHTML = '';
        const entries = Object.entries(data).sort((a,b)=>b[1]-a[1]);
        const total = entries.reduce((s,kv)=>s+kv[1],0) || 0;
        if (!entries.length) { legendEl.textContent = 'No visitor data available.'; return; }

        // Render top 30 points
        const maxCount = entries[0][1];
        entries.slice(0,30).forEach(([code,count],i)=>{
            const c = (centroids[code]||null);
            if (!c) return; // skip unknown centroid
            const [x,y] = project(c[0], c[1]);
            const r = Math.max(4, (count / maxCount) * 18);
            const circle = document.createElementNS('http://www.w3.org/2000/svg','circle');
            circle.setAttribute('cx', x.toString());
            circle.setAttribute('cy', y.toString());
            circle.setAttribute('r', r.toString());
            circle.setAttribute('class','visitor-dot');
            circle.setAttribute('data-code', code);
            circle.setAttribute('data-count', count);
            circle.setAttribute('title', `${code}: ${count} visitors`);
            dots.appendChild(circle);
        });

        // Build legend list
        legendEl.innerHTML = '<h4>Top visitor countries</h4>';
        entries.slice(0,20).forEach(([code,count])=>{
            const div = document.createElement('div');
            div.className = 'country-item';
            const left = document.createElement('div'); left.textContent = `${code}`;
            const right = document.createElement('div'); right.textContent = `${count}`;
            div.appendChild(left); div.appendChild(right);
            legendEl.appendChild(div);
        });
        const foot = document.createElement('div'); foot.style.marginTop='0.6rem'; foot.style.fontSize='0.95rem'; foot.style.color='var(--text-muted)'; foot.textContent = `Total visitors in dataset: ${total}`;
        legendEl.appendChild(foot);
    }

    async function fetchData() {
        const analyticsOptIn = localStorage.getItem('site_analytics_opt_in_v1') === 'true';
        if (!analyticsOptIn) {
            legendEl.textContent = 'Visitor map is available when analytics opt-in is enabled in Privacy settings.';
            return;
        }

        // Try local data first
        try {
            const r = await fetch('/data/visitors.json', {cache: 'no-store'});
            if (r.ok) {
                const d = await r.json(); render(d); return;
            }
        } catch(e) {}

        // Try configurable endpoint via meta tag
        const meta = document.querySelector('meta[name="visitor-data-endpoint"]');
        if (meta && meta.content) {
            try {
                const r = await fetch(meta.content, {credentials:'omit'});
                if (r.ok) { const d = await r.json(); render(d); return; }
            } catch(e) {}
        }

        legendEl.textContent = 'Visitor data endpoint not configured. To enable live visitor map, provide aggregated country counts at /data/visitors.json or configure a visitor-data-endpoint meta tag.';
    }

    fetchData();

});

// ============================================
// Mobile Menu Toggle
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Theme toggle removed

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });
});

// ============================================
// Publications Page: Search & Filter
// ============================================

if (document.querySelector('.publications')) {
    document.addEventListener('DOMContentLoaded', () => {
        const searchInput = document.getElementById('publication-search');
        const searchClear = document.getElementById('search-clear');
        const searchResultsInfo = document.getElementById('search-results-info');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const sortButtons = document.querySelectorAll('.sort-btn');
        const publicationCategories = document.querySelectorAll('.publication-category');
        const publicationItems = document.querySelectorAll('.publication-item');

        let currentFilter = 'all';
        let currentSort = 'year-desc';

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                
                // Show/hide clear button
                if (searchClear) {
                    searchClear.classList.toggle('active', searchTerm.length > 0);
                }

                performSearch(searchTerm);
            });
        }

        // Clear search
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchClear.classList.remove('active');
                performSearch('');
            });
        }

        // Filter functionality
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');

                currentFilter = button.getAttribute('data-filter');
                applyFiltersAndSort();
            });
        });

        // Sort functionality
        sortButtons.forEach(button => {
            button.addEventListener('click', () => {
                sortButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                currentSort = button.getAttribute('data-sort');
                applyFiltersAndSort();
            });
        });

        function performSearch(searchTerm) {
            let visibleCount = 0;

            publicationItems.forEach(item => {
                const title = item.querySelector('h4').textContent.toLowerCase();
                const details = item.querySelector('.pub-details').textContent.toLowerCase();
                const category = item.closest('.publication-category').getAttribute('data-category');

                // Check if matches search and current filter
                const matchesSearch = searchTerm === '' || title.includes(searchTerm) || details.includes(searchTerm);
                const matchesFilter = currentFilter === 'all' || category === currentFilter;

                if (matchesSearch && matchesFilter) {
                    item.style.display = 'block';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            // Update categories visibility
            publicationCategories.forEach(category => {
                const categoryType = category.getAttribute('data-category');
                const visibleItems = category.querySelectorAll('.publication-item[style*="display: block"]');
                
                if (currentFilter === 'all') {
                    category.style.display = visibleItems.length > 0 ? 'block' : 'none';
                } else if (categoryType === currentFilter) {
                    category.style.display = visibleItems.length > 0 ? 'block' : 'none';
                } else {
                    category.style.display = 'none';
                }
            });

            // Update results info
            if (searchResultsInfo) {
                if (searchTerm) {
                    searchResultsInfo.textContent = `Showing ${visibleCount} result${visibleCount !== 1 ? 's' : ''} for "${searchTerm}"`;
                    searchResultsInfo.style.display = 'block';
                } else {
                    searchResultsInfo.style.display = 'none';
                }
            }
        }

        function applyFiltersAndSort() {
            // First, show/hide all publication items based on filter
            publicationItems.forEach(item => {
                const category = item.closest('.publication-category').getAttribute('data-category');
                
                if (currentFilter === 'all' || category === currentFilter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Show/hide categories based on filter
            publicationCategories.forEach(category => {
                const categoryType = category.getAttribute('data-category');
                
                if (currentFilter === 'all') {
                    category.style.display = 'block';
                } else if (categoryType === currentFilter) {
                    category.style.display = 'block';
                } else {
                    category.style.display = 'none';
                }
            });

            // Apply sorting
            if (currentSort !== 'default') {
                publicationCategories.forEach(category => {
                    const items = Array.from(category.querySelectorAll('.publication-item'));
                    const container = category;

                    items.sort((a, b) => {
                        const yearA = parseInt(a.querySelector('.pub-year')?.textContent || '0');
                        const yearB = parseInt(b.querySelector('.pub-year')?.textContent || '0');

                        if (currentSort === 'year-desc') {
                            return yearB - yearA;
                        } else if (currentSort === 'year-asc') {
                            return yearA - yearB;
                        }
                        return 0;
                    });

                    // Re-append sorted items
                    const heading = container.querySelector('h3');
                    items.forEach(item => {
                        container.appendChild(item);
                    });
                    if (heading) {
                        container.insertBefore(heading, container.firstChild);
                    }
                });
            }

            // Re-apply search if there's an active search
            if (searchInput && searchInput.value) {
                performSearch(searchInput.value.toLowerCase().trim());
            }
        }
    });
}

// ============================================
// Gallery Lightbox Functionality
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (galleryItems.length === 0) return; // No gallery on this page
    
    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Close lightbox">×</button>
            <button class="lightbox-nav lightbox-prev" aria-label="Previous image">‹</button>
            <img src="" alt="">
            <button class="lightbox-nav lightbox-next" aria-label="Next image">›</button>
            <div class="lightbox-caption"></div>
        </div>
    `;
    document.body.appendChild(lightbox);
    
    const lightboxImg = lightbox.querySelector('img');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    let currentIndex = 0;
    const images = Array.from(galleryItems);
    
    // Open lightbox
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            currentIndex = index;
            showImage(currentIndex);
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    closeBtn.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Navigate images
    function showImage(index) {
        const item = images[index];
        const img = item.querySelector('img');
        const overlay = item.querySelector('.gallery-item-overlay');
        
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        
        if (overlay) {
            const title = overlay.querySelector('h4')?.textContent || '';
            const desc = overlay.querySelector('p')?.textContent || '';
            lightboxCaption.textContent = title + (desc ? ' - ' + desc : '');
        } else {
            lightboxCaption.textContent = img.alt;
        }
    }
    
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        showImage(currentIndex);
    });
    
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % images.length;
        showImage(currentIndex);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            showImage(currentIndex);
        } else if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % images.length;
            showImage(currentIndex);
        }
    });
});

// ============================================
// Contact Form Handling
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) return; // No contact form on this page
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formSuccess = document.getElementById('form-success');
        const formError = document.getElementById('form-error');
        const submitButton = contactForm.querySelector('.form-submit');
        
        // Get form data
        const messageField = document.getElementById('message');
        const messageValue = messageField.value.trim();
        
        // Validate message length
        if (messageValue.length < 50) {
            formError.textContent = '✗ Please provide a more detailed message (minimum 50 characters)';
            formError.classList.add('active');
            formSuccess.classList.remove('active');
            return;
        }
        
        // Disable submit button
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        // Submit to Formspree
        try {
            const formData = new FormData(contactForm);
            
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                // Show success message
                formSuccess.classList.add('active');
                formError.classList.remove('active');
                
                // Reset form
                contactForm.reset();
                
                // Re-enable button
                submitButton.disabled = false;
                submitButton.textContent = 'Send Message';
            } else {
                throw new Error('Form submission failed');
            }
            
        } catch (error) {
            // Show error message
            formError.textContent = '✗ There was an error sending your message. Please email me directly at fadedoyin@bournemouth.ac.uk';
            formError.classList.add('active');
            formSuccess.classList.remove('active');
            
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        }
    });
});

// ============================================
// Scroll to Top Button
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (!scrollToTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.classList.remove('visible');
        }
    });
    
    // Smooth scroll to top
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

// ============================================
// Animated Statistics Counter
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const statNumbers = document.querySelectorAll('.stat-number[data-target], .impact-value[data-target]');
    
    if (statNumbers.length === 0) return;
    
    const animateCounter = (element) => {
        const target = parseInt(element.dataset.target);
        const suffix = element.dataset.suffix || '';
        const prefix = element.textContent.match(/^[^0-9]+/) ? element.textContent.match(/^[^0-9]+/)[0] : '';
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = prefix + Math.floor(current) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = prefix + target + suffix;
            }
        };
        
        updateCounter();
    };
    
    // Intersection Observer for triggering animation when stats come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
});

// ============================================
// BibTeX Export Functionality
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.getElementById('export-bibtex-all');
    
    if (!exportBtn) return;
    
    // Function to extract publication data and convert to BibTeX
    const exportToBibTeX = () => {
        const publications = document.querySelectorAll('.publication-item');
        let bibtexContent = '';
        
        publications.forEach((pub, index) => {
            const yearElement = pub.querySelector('.pub-year');
            const titleElement = pub.querySelector('h4');
            const detailsElement = pub.querySelector('.pub-details, .pub-venue');
            
            if (!yearElement || !titleElement) return;
            
            const year = yearElement.textContent.trim();
            const title = titleElement.textContent.trim();
            const details = detailsElement ? detailsElement.textContent.trim() : '';
            
            // Extract authors (simple extraction - assumes format "Author1, Author2, ...")
            let authors = '';
            const authorMatch = details.match(/^([^(]+?)\(/);
            if (authorMatch) {
                authors = authorMatch[1].trim();
            } else {
                authors = details.split('.')[0];
            }
            
            // Extract venue/journal
            const venueMatch = details.match(/In\s+<em>([^<]+)<\/em>/);
            const venue = venueMatch ? venueMatch[1] : 'Unknown Venue';
            
            // Generate citation key
            const firstAuthor = authors.split(',')[0].trim().replace(/\s+/g, '').replace(/\./g, '');
            const firstWord = title.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
            const citationKey = `${firstAuthor}${year}${firstWord}`;
            
            // Build BibTeX entry
            bibtexContent += `@article{${citationKey},\n`;
            bibtexContent += `  author = {${authors}},\n`;
            bibtexContent += `  title = {${title}},\n`;
            bibtexContent += `  year = {${year}},\n`;
            bibtexContent += `  journal = {${venue}},\n`;
            bibtexContent += `  note = {Details extracted from publication list}\n`;
            bibtexContent += `}\n\n`;
        });
        
        // Create and download file
        const blob = new Blob([bibtexContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Adedoyin_Publications.bib';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // Show confirmation
        const originalText = exportBtn.textContent;
        exportBtn.textContent = '✓ Exported!';
        exportBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        
        setTimeout(() => {
            exportBtn.textContent = originalText;
        }, 2000);
    };
    
    exportBtn.addEventListener('click', exportToBibTeX);
});

    // ============================================
    // Cookie consent / GDPR banner
    // Lightweight consent banner stored in localStorage
    // ============================================

    document.addEventListener('DOMContentLoaded', () => {
        const consentKey = 'site_cookie_consent_v1';

        function hasConsent() {
            return localStorage.getItem(consentKey) !== null;
        }

        function setConsent(value) {
            localStorage.setItem(consentKey, value);
        }

        function createBanner() {
            if (hasConsent()) return;

            const banner = document.createElement('div');
            banner.id = 'cookie-banner';
            banner.innerHTML = `
                <div class="cookie-inner container">
                    <div class="cookie-text">
                        <strong>EU visitors:</strong> This site uses only essential cookies and minimal third-party services (e.g. font delivery, contact form). Read our <a href="/privacy.html">Privacy Policy</a> for details.
                    </div>
                    <div class="cookie-actions">
                        <button id="cookie-accept" class="btn btn-primary">Accept</button>
                        <button id="cookie-reject" class="btn btn-secondary">Reject</button>
                        <button id="cookie-manage" class="btn">Manage</button>
                    </div>
                </div>
            `;

            document.body.appendChild(banner);

            document.getElementById('cookie-accept').addEventListener('click', () => {
                setConsent('accepted');
                banner.remove();
            });

            document.getElementById('cookie-reject').addEventListener('click', () => {
                setConsent('rejected');
                banner.remove();
            });

            document.getElementById('cookie-manage').addEventListener('click', () => {
                openManageDialog();
            });
        }

        function openManageDialog() {
            // simple dialog to show options
            const dlg = document.createElement('div');
            dlg.className = 'cookie-manage';
            dlg.innerHTML = `
                <div class="cookie-manage-inner container">
                    <h3>Manage Cookie Preferences</h3>
                    <p>You can choose whether to accept non-essential cookies. Essential cookies required for site function will remain.</p>
                    <div class="manage-actions">
                        <button id="manage-accept" class="btn btn-primary">Accept All</button>
                        <button id="manage-reject" class="btn btn-secondary">Reject All</button>
                        <button id="manage-close" class="btn">Close</button>
                    </div>
                </div>
            `;

            document.body.appendChild(dlg);

            document.getElementById('manage-accept').addEventListener('click', () => {
                setConsent('accepted');
                dlg.remove();
                const b = document.getElementById('cookie-banner'); if (b) b.remove();
            });

            document.getElementById('manage-reject').addEventListener('click', () => {
                setConsent('rejected');
                dlg.remove();
                const b = document.getElementById('cookie-banner'); if (b) b.remove();
            });

            document.getElementById('manage-close').addEventListener('click', () => {
                dlg.remove();
            });
        }

        // Defer creating banner slightly to avoid flash before CSS loads
        setTimeout(createBanner, 350);
    });

    // Connect analytics toggle on privacy page to local preference
    document.addEventListener('DOMContentLoaded', () => {
        const analyticsToggle = document.getElementById('analytics-toggle');
        const analyticsKey = 'site_analytics_opt_in_v1';

        if (!analyticsToggle) return;

        const current = localStorage.getItem(analyticsKey);
        analyticsToggle.checked = current === 'true';

        analyticsToggle.addEventListener('change', (e) => {
            const enabled = e.target.checked;
            localStorage.setItem(analyticsKey, enabled ? 'true' : 'false');
            // Optionally initialize or disable analytics here
            if (enabled) {
                console.info('Analytics enabled (user preference)');
            } else {
                console.info('Analytics disabled (user preference)');
            }
        });
    });

// ============================================
// Active navigation highlight
// Adds `active` class and `aria-current="page"` to the matching nav link
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    try {
        var links = Array.from(document.querySelectorAll('.nav-menu a'));
        var path = window.location.pathname.split('/').pop();
        if (!path || path === '') path = 'index.html';

        links.forEach(function(link){
            try {
                var href = link.getAttribute('href');
                if(!href) return;
                // Normalize href last segment
                var hrefName = href.split('/').pop();
                if(!hrefName) hrefName = href;
                if(hrefName === path || (path === 'index.html' && (hrefName === 'index.html' || hrefName === './' || hrefName === '/'))){
                    link.classList.add('active');
                    link.setAttribute('aria-current','page');
                } else {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                }
            } catch (e) { /* ignore per-link errors */ }
        });
    } catch (e) { console.warn('nav highlight error', e); }
});

// ============================================
// Site-wide accessibility and small UI enhancements
// - Inject a skip link
// - Breadcrumb insertion under navbar
// - Floating contact CTA
// - Lightweight search overlay using local search_index.json
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Inject skip link (accessible target present on pages)
        if (!document.getElementById('skip-link')) {
            const skip = document.createElement('a');
            skip.href = '#main-content';
            skip.id = 'skip-link';
            skip.className = 'skip-link';
            skip.textContent = 'Skip to main content';
            document.body.insertBefore(skip, document.body.firstChild);
        }

        // Ensure main content has id for skip
        const main = document.querySelector('main') || document.querySelector('.container');
        if (main && !main.id) main.id = 'main-content';

        // Breadcrumb insertion (simple heuristic)
        const nav = document.querySelector('.navbar');
        if (nav) {
            const path = window.location.pathname.split('/').pop() || 'index.html';
            const map = {
                'index.html':'Home', 'about.html':'About', 'research.html':'Research', 'projects.html':'AI Projects', 'publications.html':'Publications', 'contact.html':'Contact', 'teaching.html':'Teaching', 'volunteering.html':'Volunteering'
            };
            const label = map[path] || document.title || path;
            const bc = document.createElement('div');
            bc.className = 'container breadcrumb';
            bc.innerHTML = `<a href="index.html">Home</a> &rsaquo; <span aria-current="page">${label.replace(/\.(html)$/,'')}</span>`;
            nav.after(bc);
        }

        // Floating CTA
        if (!document.querySelector('.floating-cta')) {
            const f = document.createElement('div');
            f.className = 'floating-cta';
            f.innerHTML = `<a href="contact.html" class="cta-btn" aria-label="Contact Dr Festus Adedoyin"><span class="icon">✉</span><span>Contact</span></a>`;
            document.body.appendChild(f);
        }

        // Lightweight search overlay setup
        (function(){
            // add search button to nav (if not present)
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu && !document.getElementById('nav-search-toggle')) {
                const li = document.createElement('li');
                li.innerHTML = '<button id="nav-search-toggle" class="filter nav-search-btn" aria-label="Open site search"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"></circle><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"></line></svg></button>';
                navMenu.appendChild(li);
            }

            // create overlay element
            if (!document.querySelector('.search-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'search-overlay';
                overlay.innerHTML = `
                    <div class="search-box" role="dialog" aria-modal="true" aria-label="Site search">
                        <input id="global-search-input" class="search-input-full" placeholder="Search projects, publications, pages..." aria-label="Search site">
                        <div id="search-results" class="search-results" role="list"></div>
                    </div>
                `;
                document.body.appendChild(overlay);

                // open/close handlers
                document.getElementById('nav-search-toggle')?.addEventListener('click', () => { overlay.classList.add('active'); document.getElementById('global-search-input').focus(); });
                overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('active'); });
                document.addEventListener('keydown', (e) => { if (e.key==='Escape') overlay.classList.remove('active'); });

                // search logic (simple substring search against local JSON index)
                let index = [];
                fetch('search_index.json').then(r=>r.json()).then(data=>{ index = data; }).catch(()=>{ index = []; });

                const input = document.getElementById('global-search-input');
                const resultsEl = document.getElementById('search-results');
                let timer;
                input && input.addEventListener('input', (e) => {
                    clearTimeout(timer);
                    timer = setTimeout(()=>{
                        const q = (e.target.value||'').toLowerCase().trim();
                        resultsEl.innerHTML = '';
                        if (!q) return;
                        const matches = index.filter(item => (item.title+ ' '+ item.text).toLowerCase().indexOf(q) !== -1).slice(0,20);
                        if (matches.length===0) { resultsEl.innerHTML = '<div class="search-result">No results</div>'; return; }
                        matches.forEach(m => {
                            const a = document.createElement('a');
                            a.className = 'search-result';
                            a.href = m.url;
                            a.innerHTML = `<strong>${m.title}</strong><div style="font-size:0.9rem;color:var(--text-light)">${m.text.slice(0,160)}${m.text.length>160?'…':''}</div>`;
                            resultsEl.appendChild(a);
                        });
                    }, 180);
                });
            }
        })();

    } catch (e) { console.warn('enhancement init error', e); }
});
