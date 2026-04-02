const enquiryForm = document.getElementById('enquiryForm');
const formNote = document.getElementById('formNote');
const inspoUpload = document.getElementById('inspoUpload');
const inspoPreview = document.getElementById('inspoPreview');
const uploadNote = document.getElementById('uploadNote');

// Live preview when files are selected
if (inspoUpload) {
    inspoUpload.addEventListener('change', () => {
        const files = Array.from(inspoUpload.files).slice(0, 6);
        inspoPreview.innerHTML = '';
        uploadNote.textContent = '';

        if (files.length === 0) return;

        files.forEach((file) => {
            if (!file.type.startsWith('image/')) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                img.className = 'preview-thumb';
                inspoPreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });

        uploadNote.textContent = `${files.length} photo${files.length > 1 ? 's' : ''} selected. Send them in WhatsApp after it opens.`;
    });
}

if (enquiryForm) {
    enquiryForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(enquiryForm);
        const name = formData.get('name')?.toString().trim() || '';
        const occasion = formData.get('occasion')?.toString().trim() || '';
        const date = formData.get('date')?.toString().trim() || '';
        const details = formData.get('details')?.toString().trim() || '';
        const fileCount = inspoUpload && inspoUpload.files.length > 0
            ? `\nInspo photos: ${inspoUpload.files.length} image${inspoUpload.files.length > 1 ? 's' : ''} selected — I will send them here in WhatsApp.`
            : '';

        const message = [
            'Hello Daisy Treats, I would like to make an enquiry.',
            '',
            `Name: ${name}`,
            `Occasion: ${occasion}`,
            `Preferred date: ${date}`,
            `Order details: ${details || 'To be discussed'}`,
            fileCount
        ].join('\n');

        const whatsappUrl = `https://wa.me/447721641230?text=${encodeURIComponent(message)}`;

        window.open(whatsappUrl, '_blank', 'noopener');

        if (formNote) {
            formNote.textContent = inspoUpload && inspoUpload.files.length > 0
                ? 'WhatsApp opened. Now send your inspiration photos directly in the chat.'
                : 'WhatsApp opened in a new tab with your enquiry message.';
        }
    });
}

// ── Production additions ─────────────────────────────

// Current year in footer
const yearEl = document.getElementById('currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Block past dates in the date picker
const dateInput = document.getElementById('inputDate');
if (dateInput) {
    dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
}

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const siteNavEl = document.getElementById('site-nav');
if (navToggle && siteNavEl) {
    navToggle.addEventListener('click', () => {
        const isOpen = siteNavEl.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
        navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
    siteNavEl.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            siteNavEl.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.setAttribute('aria-label', 'Open menu');
        });
    });
}

// Scrolled header shadow
const siteHeaderEl = document.getElementById('site-header');
if (siteHeaderEl) {
    window.addEventListener('scroll', () => {
        siteHeaderEl.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
}

// Floating WhatsApp button appears after scrolling
const fab = document.querySelector('.whatsapp-fab');
if (fab) {
    const toggleFab = () => fab.classList.toggle('visible', window.scrollY > 240);
    window.addEventListener('scroll', toggleFab, { passive: true });
    toggleFab();
}

// Active nav link on scroll
const navSections = document.querySelectorAll('main section[id]');
const navLinkEls = document.querySelectorAll('.site-nav a[href^="#"]');
if (navSections.length && navLinkEls.length) {
    const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            navLinkEls.forEach((link) => {
                link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
            });
        });
    }, { rootMargin: '-35% 0px -60% 0px' });
    navSections.forEach((s) => spy.observe(s));
}

// Scroll reveal for sections
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.06 });
    document.querySelectorAll('main section').forEach((el, i) => {
        el.classList.add('reveal');
        if (i === 0) {
            el.classList.add('in-view');
        } else {
            revealObs.observe(el);
        }
    });
}