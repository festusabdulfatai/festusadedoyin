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
